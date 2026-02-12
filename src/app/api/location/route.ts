import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSelectedAddressLocationForUser } from "@/lib/location/service";

export async function GET() {
    const user = await requireUser();  
    const location = await getSelectedAddressLocationForUser(user.id);

    return NextResponse.json(location);
}