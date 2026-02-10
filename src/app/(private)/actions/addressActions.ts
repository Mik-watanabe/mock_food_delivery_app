"use server"

import { AddressSuggestion } from "@/types/data";
import { fetchPlaceDetails } from "@/lib/restaurants/api";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
interface SelectedAddressActionParams {
    suggestion: AddressSuggestion;
    sessionToken: string;
}

export async function registerAddressAction({ suggestion, sessionToken }: SelectedAddressActionParams) {

    const supabase = await createClient();
    let data;

    // Retrieve address details using the place ID from the suggestion
    try {
        // Use a session token to optimize Google API costs.
        data = await fetchPlaceDetails(suggestion.placeId, ["location"], sessionToken);

        if (
            !data.res.location ||
            data.res.location.latitude == null ||
            data.res.location.longitude == null
        ) {
            console.error("Location details are missing in the response:", data.res);
            return { ok: false as const, error: "Failed to retrieve location details." };
        }
        // return { ok: true as const, data: res };
    } catch (e) {
        console.error("selectedAddressAction failed", e);
        return { ok: false as const, error: "Failed to retrieve place details." };
    }

    // insert address and user info into supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }
    const { data: insertedAddress, error: insertError } = await supabase.from("addresses").insert({
        name: suggestion.placeName,
        address_text: suggestion.address_text,
        lat: data.res.location.latitude,
        lng: data.res.location.longitude,
        user_id: user.id
    }).select("id").single();

    if (insertError) {
        console.error("Failed to insert address into database:", insertError);
        return { ok: false as const, error: "Failed to save the address. Please try again." };
    }

    const { error: updateError } = await supabase.from("profiles").update({ selected_address_id: insertedAddress.id }).eq("id", user.id);
    if (updateError) {
        console.error("Failed to update profile with selected address:", updateError);
        return { ok: false as const, error: "Failed to update profile with selected address" };
    }

    return { ok: true as const };
}

export async function updateSelectedAddressAction(addressId: number) {

    const supabase = await createClient();
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            redirect("/login");
        }
        const { error: updateError } = await supabase.from("profiles").update({ selected_address_id: addressId }).eq("id", user.id);
        if (updateError) {
            console.error("Failed to update profile with selected address:", updateError);
            return { ok: false as const, error: "Failed to update profile with selected address" };
        }

        return { ok: true as const };
    } catch (e) {
        console.error("updateSelectedAddressAction failed:", e);
        return {
            ok: false as const,
            error: "Unexpected error occurred",
        };
    }
}

export async function deleteAddressAction(addressId: number) {
    const supabase = await createClient();

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            redirect("/login");
        }

        const { error: deleteError } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);
        if (deleteError) {
            console.error("Failed to delete address:", deleteError);
            return { ok: false as const, error: "Failed to delete the address. Please try again." };
        }
        return { ok: true as const };
    } catch (e) {
        console.error("deleteAddressAction failed:", e);
        return {
            ok: false as const,
            error: "Unexpected error occurred",
        };
    }
}