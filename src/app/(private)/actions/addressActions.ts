"use server"

import { AddressSuggestion, Location } from "@/types/data";
import { fetchPlaceDetails } from "@/lib/restaurants/googlePlaces";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { addAddressForUser, deleteAddressForUser, updateSelectedAddressForUser } from "@/lib/location/service";
import { cookies } from "next/dist/server/request/cookies";

interface SelectedAddressActionParams {
    suggestion: AddressSuggestion;
    sessionToken: string;
}

const COOKIE_KEY = "selected_location";
const DEFAULT_LOCATION: Location = {
    lat: 43.8828, lng: -79.4403
};

export async function registerAddressAction({ suggestion, sessionToken }: SelectedAddressActionParams) {

    let data;
    try {
        // Retrieve address details using the place ID from the suggestion
        // Use a session token to optimize Google API costs.
        data = await fetchPlaceDetails(suggestion.placeId, ["location"], sessionToken);

        if (
            !data.res.location ||
            data.res.location.latitude == null ||
            data.res.location.longitude == null
        ) {
            return { ok: false as const, error: "Failed to retrieve location details." };
        }

        // TODO: ADD TRANSACTION HERE TO ENSURE BOTH INSERT AND UPDATE HAPPEN TOGETHER
        // insert address and user info into supabase
        const user = await requireUser();
        const insertedAddress = await addAddressForUser({
            userId: user.id,
            name: suggestion.placeName,
            addressText: suggestion.address_text,
            lat: data.res.location.latitude,
            lng: data.res.location.longitude,
        });
        const location = await updateSelectedAddressForUser(user.id, insertedAddress.id);

        await writeLocationCookie(location); // Update the cookie to default location until we implement fetching the actual location from the selected address
        console.log("Updated selected address and cookie location:", location);

        revalidatePath("/", "layout");
        return { ok: true as const };
    } catch (e) {
        console.error("selectedAddressAction failed", e);
        return { ok: false as const, error: "Failed to retrieve place details." };
    }
}

export async function updateSelectedAddressAction(addressId: number) {
    try {
        const user = await requireUser();
        const location = await updateSelectedAddressForUser(user.id, addressId); //lib/location/service.ts

        await writeLocationCookie(location); // Update the cookie to default location until we implement fetching the actual location from the selected address
        console.log("Updated selected address and cookie location:", location);

        revalidatePath("/", "layout");

        return { ok: true as const };
    } catch (e) {
        console.error("updateSelectedAddressAction failed:", e);
        return {
            ok: false as const,
            error: "Failed to update the selected address. Please try again.",
        };
    }
}

export async function deleteAddressAction(addressId: number, isSelectedAddress: boolean) {

    try {
        const user = await requireUser();
        await deleteAddressForUser(user.id, addressId); //lib/location/service.ts

        revalidatePath("/", "layout");
        if (isSelectedAddress) await writeLocationCookie(DEFAULT_LOCATION);
        return { ok: true as const };
    } catch (e) {
        console.error("deleteAddressAction failed:", e);
        return {
            ok: false as const,
            error: "Failed to delete the address. Please try again.",
        };
    }
}

async function writeLocationCookie(location: Location) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_KEY, JSON.stringify(location), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
    })
}