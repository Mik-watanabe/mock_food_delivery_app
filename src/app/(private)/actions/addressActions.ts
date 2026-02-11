"use server"

import { AddressSuggestion } from "@/types/data";
import { fetchPlaceDetails } from "@/lib/restaurants/googlePlaces";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { addAddressForUser, deleteAddressForUser, updateSelectedAddressForUser } from "@/lib/location/service";

interface SelectedAddressActionParams {
    suggestion: AddressSuggestion;
    sessionToken: string;
}

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

        await updateSelectedAddressForUser(user.id, insertedAddress.id);

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
        await updateSelectedAddressForUser(user.id, addressId); //lib/location/service.ts

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

export async function deleteAddressAction(addressId: number) {
    try {
        const user = await requireUser();
        await deleteAddressForUser(user.id, addressId); //lib/location/service.ts

        revalidatePath("/", "layout");
        return { ok: true as const };
    } catch (e) {
        console.error("deleteAddressAction failed:", e);
        return {
            ok: false as const,
            error: "Failed to delete the address. Please try again.",
        };
    }
}