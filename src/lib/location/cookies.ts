import "server-only";
import { cookies } from "next/headers";
import { Location } from "@/types/data";

const COOKIE_KEY = "selected_location";
const DEFAULT_LOCATION: Location = {
    lat: 43.8828, lng: -79.4403
};

export async function readLocationCookie(): Promise<Location> {

    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_KEY)?.value;
    if (!raw) return DEFAULT_LOCATION;

    try {
        const parsed = JSON.parse(raw) as Location;
        if (typeof parsed.lat !== "number" && typeof parsed.lng !== "number") {
            return DEFAULT_LOCATION;
        }
        return parsed;
    } catch {
        return DEFAULT_LOCATION;
    }
}