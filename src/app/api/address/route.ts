import { createClient } from '@/lib/supabase/server';
import { Address } from '@/types/data';
import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {

    try {
        // Get a list of addresses associated with the user from the database
        let addresses: Address[] = [];
        let selectedAddress: Address | null = null;

        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: addressData, error: addressError } = await supabase.from("addresses").select("id, name, address_text, lat, lng").eq("user_id", user.id).order('id', { ascending: false });

        if (addressError) {
            return NextResponse.json({ error: "Failed to retrieve addresses" }, { status: 500 });
        }

        addresses = addressData;
        const { data: profileData, error: profileError } = await supabase.from("profiles").select("addresses(id, name, address_text, lat, lng)").eq("id", user.id).single();
        if (profileError) {
            return NextResponse.json({ error: "Failed to retrieve profile" }, { status: 500 });
        }

        selectedAddress = profileData?.addresses;

        return NextResponse.json({ addresses, selectedAddress });
    } catch (error) {
        console.error("An unexpected while fetching address", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}