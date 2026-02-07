import { GoogleAutoCompleteApiResponse, PlaceSuggestion } from '@/types/data';
import { error } from 'console';
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_CENTER = { lat: 43.8828, lng: -79.4403 } // Richmond Hill
const DEFAULT_RADIUS = 3000

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const query = params.get('query') || '';
    const sessionToken = params.get('sessionToken') || '';

    if (!query) {
        return NextResponse.json(error('Query parameter is required'), { status: 400 });
    }
    if (!sessionToken) {
        return NextResponse.json(error('Session token is required'), { status: 400 });
    }

    try {
        const url = "https://places.googleapis.com/v1/places:autocomplete";

        const header = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.GOOGLE_API_KEY!,
        }

        const requestBody = {
            sessionToken: sessionToken,
            input: query,
            "includeQueryPredictions": true,
            includedPrimaryTypes: ["restaurant"],
            locationBias: {
                circle: {
                    center: {
                        latitude: DEFAULT_CENTER.lat,
                        longitude: DEFAULT_CENTER.lng
                    },
                    radius: DEFAULT_RADIUS
                }
            },
            languageCode: 'en',
            // includedRegionCodes: ["ca"],
        }

        const response = await fetch(url, {
            method: "POST",
            headers: header,
            body: JSON.stringify(requestBody),
            cache: "force-cache",
            next: { revalidate: 86400 }, // Revalidate every 24 hours
        })

        const body: GoogleAutoCompleteApiResponse = await response.json();

        if (!response.ok) {
            console.error(body);

            throw new Error(`Autocomplete request error: ${response.status} ${response.statusText}`);
        }

        const suggestions = body.suggestions || [];

        const results = suggestions.flatMap(suggestion => {
            const place = suggestion.placePrediction
            const query = suggestion.queryPrediction

            if (place?.placeId && place.structuredFormat?.mainText?.text) {
                return [{
                    type: 'placePrediction',
                    placeId: place.placeId,
                    placeName: place.structuredFormat.mainText.text,
                } as PlaceSuggestion]
            }

            if (query?.text?.text) {
                return [{
                    type: 'queryPrediction',
                    placeName: query.text.text,
                } as PlaceSuggestion]
            }

            return []
        })
        return NextResponse.json({ suggestions: results });

        // console.log(JSON.stringify(body, null, 2));
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json({ error: "unexpected error happened" }, { status: 500 });
    }

    return NextResponse.json({ suggestions: [] });
}