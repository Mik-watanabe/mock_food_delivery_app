
import "server-only";
import { readLocationCookie } from "./cookies";

export async function resolveUserLocation() {
    return await readLocationCookie();
}   