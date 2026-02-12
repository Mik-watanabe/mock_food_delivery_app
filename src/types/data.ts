import { CATEGORY_MAP } from "@/lib/restaurants/constants";

export interface GooglePlacesApiResponse {
    places?: PlaceSearchResult[];
    error?: string;
}

export interface GooglePlacesDetailsApiResponse {
    location?: {
        latitude: number;
        longitude: number;
    };
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
        },
        secondaryText?: {
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

export interface AddressSuggestion {
    placeId: string;
    placeName: string;
    address_text: string;
}


export interface Location {
    lat: number;
    lng: number;
}

export interface GoogleLocation {
    latitude: number;
    longitude: number;
}

export interface GooglePlaceDetails {
    location?: GoogleLocation;
}

export interface Address {
    id: number;
    name: string;
    address_text: string;
    lat: number;
    lng: number;
}