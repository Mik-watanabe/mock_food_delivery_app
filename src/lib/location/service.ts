import "server-only";
import { createClient } from "../supabase/server";

const DEFAULT_CENTER = { lat: 43.8828, lng: -79.4403 } // Richmond Hill

/**
 * To register an address associated with the user
 */
interface addAddressForUserParams {
    userId: string;
    name: string;
    addressText: string;
    lat: number;
    lng: number;
}

export async function addAddressForUser({ userId, name, addressText, lat, lng }: addAddressForUserParams) {
    const supabase = await createClient();
    const { data: insertedAddress, error: insertError } = await supabase.from("addresses").insert({
        name: name,
        address_text: addressText,
        lat: lat,
        lng: lng,
        user_id: userId
    }).select("id").single();
    if (insertError) {
        throw new Error(`Failed to insert address: ${insertError.message}`);
    }
    return insertedAddress;
}

/**
 * To update the selected address associated with the user
 */

export async function updateSelectedAddressForUser(userId: string, addressId: number) {
    const supabase = await createClient();

    const { data: profile, error: updateError } = await supabase
        .from("profiles").update({ selected_address_id: addressId })
        .eq("id", userId)
        .select("id, selected_address_id, addresses(lat, lng)")
        .single();

    if (updateError) {
        throw new Error(`Failed to update selected address: ${updateError.message}`);
    }
    return {
        lat: profile?.addresses?.lat ?? DEFAULT_CENTER.lat,
        lng: profile?.addresses?.lng ?? DEFAULT_CENTER.lng
    };
}


/**
 * To delete the address associated with the user
 */
export async function deleteAddressForUser(userId: string, addressId: number) {
    const supabase = await createClient();

    const { error: deleteError } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", userId);
    if (deleteError) {
        throw new Error(`Failed to delete address: ${deleteError.message}`);
    }
}

/**
 * To retrieve the selected address location associated with the user
 */
export async function getSelectedAddressLocationForUser(userId: string) {
    const supabase = await createClient();

    const { data: selectedAddress, error: addressError } = await supabase
        .from("profiles")
        .select("addresses(lat, lng)").eq("id", userId).single();

    if (addressError) {
        throw new Error("Failed to retrieve selected address location");
    }

    console.log("Selected address location for user:", selectedAddress);

    return {
        lat: selectedAddress?.addresses?.lat ?? DEFAULT_CENTER.lat,
        lng: selectedAddress?.addresses?.lng ?? DEFAULT_CENTER.lng,
    }
}
