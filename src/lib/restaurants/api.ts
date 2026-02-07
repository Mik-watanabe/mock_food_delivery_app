import { GooglePlacesApiResponse, NearbySearchParams } from "@/types/data";
import { transformRestaurantResults } from "./utils";

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

function buildHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_API_KEY!,
        "X-Goog-FieldMask": "places.displayName,places.id,places.location,places.primaryType,places.photos",
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
                    latitude: params?.lat ?? DEFAULT_CENTER.lat,
                    longitude: params?.lng ?? DEFAULT_CENTER.lng
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

export async function fetchRestaurantsByTypes(includedTypes: string[]) {
    const body = await fetchNearbyRestaurants({ includedTypes })
    const restaurants = await transformRestaurantResults(body)
    return { restaurants }
}

export async function fetchAsianRestaurants() {
    return fetchRestaurantsByTypes(['asian_restaurant']);
}


export async function fetchAllRestaurants() {
    const { restaurants } = await fetchRestaurantsByTypes(restaurantTypes)
    return { restaurants: restaurants.filter((restaurant) => restaurantTypes.includes(restaurant.primaryType)) };
}

export async function getRestaurantPhotoUrl(name: string, maxWidth = 400, maxHeight = 400) {
    "use cache";
    const url = `https://places.googleapis.com/v1/${name}/media?key=${process.env.GOOGLE_API_KEY}&maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}`;
    return url;
}
// Search by Keyword

export async function fetchRestaurantsByKeyword(keywords: string) {
    const url = "https://places.googleapis.com/v1/places:searchText";

    // change to Included Primary Type when search by category
    const requestBody = {
        ...buildBaseRequestBody(),
        textQuery: keywords,
        pageSize: 10,
        locationBias: {
            circle: {
                center: {
                    latitude: DEFAULT_CENTER.lat,
                    longitude: DEFAULT_CENTER.lng
                },
                radius: DEFAULT_RADIUS
            }
        },
    }

    console.log(requestBody);
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