import { CATEGORY_MAP } from "@/lib/restaurants/constants";

export interface GooglePlacesApiResponse {
    places?: PlaceSearchResult[];
    error?: string;
}

export interface PlacePhoto {
    name: string;
}

export interface PlaceSearchResult {
    id: string;
    displayName: {
        text: string;
        languageCode: string;
    };
    location: {
        latitude: number;
        longitude: number;
    };
    primaryType: string;
    photos?: PlacePhoto[];
}

export interface Restaurant {
    id: string;
    restaurantName: string;
    primaryType: string;
    photoUrl: string;
}

export interface NearbySearchParams {
    includedTypes: string[]
    lat?: number
    lng?: number
    radius?: number
    maxResultCount?: number
    languageCode?: string
    rankPreference?: "distance" | "relevance"
}

export interface Category {
    type: string;
    label: string;
    icon: string;
}

export type CategoryType = keyof typeof CATEGORY_MAP

export interface GoogleAutoCompleteApiResponse {
    suggestions?: PlaceSuggestionResult[];
}

export interface PlaceSuggestionResult {
    placePrediction?: PlacePrediction;
    queryPrediction?: QueryPrediction;
}

export interface PlacePrediction {
    place?: string;
    placeId?: string;
    structuredFormat?: {
        mainText?: {
            text?: string;
        }
    }
}

export interface QueryPrediction {
    text?: {
        text?: string;
    }
}

export interface PlaceSuggestion {
    type: 'placePrediction' | 'queryPrediction';
    placeId?: string;
    placeName: string;
}

