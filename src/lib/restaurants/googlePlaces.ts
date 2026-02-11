import { GooglePlacesApiResponse, GooglePlacesDetailsApiResponse, NearbySearchParams, PlaceDetails } from "@/types/data";
import { transformRestaurantResults } from "./utils";
import { createClient } from "../supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

const restaurantTypes = [
    "cafe",
    "chinese_restaurant",
    "coffee_shop",
    "fast_food_restaurant",
    "french_restaurant",
    "hamburger_restaurant",
    "indian_restaurant",
    "italian_restaurant",
    "japanese_restaurant",
    "korean_restaurant",
    "middle_eastern_restaurant",
    "pizza_restaurant",
    "ramen_restaurant",
    "sushi_restaurant",
];

const DEFAULT_CENTER = { lat: 43.8828, lng: -79.4403 } // Richmond Hill
const DEFAULT_RADIUS = 3000

function buildHeaders(fields?: string) {
    return {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_API_KEY!,
        "X-Goog-FieldMask": fields ?? "places.displayName,places.id,places.location,places.primaryType,places.photos",
    }
}

function buildBaseRequestBody(params?: NearbySearchParams) {
    return {
        languageCode: params?.languageCode ?? 'en',
        rankPreference: params?.rankPreference ?? 'distance',
    }
}

export async function fetchNearbyRestaurants(params: NearbySearchParams) {
    const url = "https://places.googleapis.com/v1/places:searchNearby";

    // change to Included Primary Type when search by category
    const requestBody = {
        ...buildBaseRequestBody(params),
        locationRestriction: {
            circle: {
                center: {
                    latitude: params.lat,
                    longitude: params.lng
                },
                radius: params?.radius ?? DEFAULT_RADIUS
            }
        },
        includedTypes: params.includedTypes,
        maxResultCount: params?.maxResultCount ?? 10,
    }

    const response = await fetch(url, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(requestBody),
        cache: "force-cache",
        next: { revalidate: 86400 }, // Revalidate every 24 hours
    })

    const body: GooglePlacesApiResponse = await response.json();

    if (!response.ok) {
        console.error(body);

        throw new Error(`Places error: ${response.status} ${response.statusText}`);
    }

    return body;
}

export async function fetchRestaurantsByTypes({includedTypes, lat, lng}: NearbySearchParams) {
    const body = await fetchNearbyRestaurants({ includedTypes, lat, lng })
    const restaurants = await transformRestaurantResults(body)
    return { restaurants }
}

export async function fetchAsianRestaurants(location = DEFAULT_CENTER) {
    return fetchRestaurantsByTypes({includedTypes: ['asian_restaurant'], lat: location.lat, lng: location.lng });
}


export async function fetchAllRestaurants(location = DEFAULT_CENTER) {
    const { restaurants } = await fetchRestaurantsByTypes({includedTypes: restaurantTypes, lat: location.lat, lng: location.lng })
    return { restaurants: restaurants.filter((restaurant) => restaurantTypes.includes(restaurant.primaryType)) };
}

export async function getRestaurantPhotoUrl(name: string, maxWidth = 400, maxHeight = 400) {
    "use cache";
    const url = `https://places.googleapis.com/v1/${name}/media?key=${process.env.GOOGLE_API_KEY}&maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}`;
    return url;
}
// Search by Keyword
export async function fetchRestaurantsByKeyword(keywords: string, location: { lat: number; lng: number } = DEFAULT_CENTER) {
    const url = "https://places.googleapis.com/v1/places:searchText";

    const requestBody = {
        ...buildBaseRequestBody(),
        textQuery: keywords,
        pageSize: 10,
        locationBias: {
            circle: {
                center: {
                    latitude: location.lat,
                    longitude: location.lng
                },
                radius: DEFAULT_RADIUS
            }
        },
    }

    const response = await fetch(url, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(requestBody),
        cache: "force-cache",
        next: { revalidate: 86400 }, // Revalidate every 24 hours
    })

    const body: GooglePlacesApiResponse = await response.json();

    if (!response.ok) {
        console.error(body);
        throw new Error(`Failed keyword search request: ${response.status} ${response.statusText}`);
    }

    const restaurants = await transformRestaurantResults(body)
    return { restaurants }
}

export async function fetchPlaceDetails(placeId: string, fields: string[], sessionToken: string = "") {
    const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
    url.searchParams.set("languageCode", "en");
    if (sessionToken) url.searchParams.set("sessionToken", sessionToken);

    const response = await fetch(url, {
        method: "GET",
        headers: buildHeaders(fields.join(",")),
        cache: "force-cache",
        next: { revalidate: 86400 }, // Revalidate every 24 hours
    })

    const body: GooglePlacesDetailsApiResponse = await response.json();

    if (!response.ok) {
        console.error(body);
        throw new Error(`Failed place details request: ${response.status} ${response.statusText}`);
    }


    const res: Partial<PlaceDetails> = {};
    if (fields.includes("location") && body.location) {
        res.location = body.location;
    }
    return { res }
}

export const fetchLocation = cache(async () => {
    console.log("Fetching user location...");
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect("/login");
    }

    const {data: selectedAddress, error: addressError} = await supabase
        .from("profiles")
        .select("addresses(lat, lng)").eq("id", user.id).single();

     if (addressError) {
        console.error("Failed to retrieve selected address location:", addressError);
        throw new Error("Failed to retrieve selected address location");
    }

    return {
        lat: selectedAddress?.addresses?.lat ?? DEFAULT_CENTER.lat,
        lng: selectedAddress?.addresses?.lng ?? DEFAULT_CENTER.lng,
    }
})