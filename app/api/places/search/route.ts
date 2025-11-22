import { NextRequest, NextResponse } from 'next/server';

/**
 * Google Places Autocomplete API Proxy
 *
 * This endpoint proxies requests to Google Places API (New) Autocomplete service
 * to keep the API key secure on the server side.
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/autocomplete
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('input');
    const location = searchParams.get('location'); // Optional: bias results to location (lat,lng)
    const radius = searchParams.get('radius') || '50000'; // 50km default radius

    if (!input || input.trim().length < 2) {
      return NextResponse.json(
        { error: 'Input parameter is required and must be at least 2 characters' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Google Places API key is not configured' },
        { status: 500 }
      );
    }

    // Build Google Places Autocomplete API URL
    // Using the New Places API (Place Autocomplete)
    const url = new URL('https://places.googleapis.com/v1/places:autocomplete');

    // Request body for the new API
    const requestBody = {
      input: input.trim(),
      includedPrimaryTypes: ['restaurant', 'cafe', 'bakery', 'bar', 'meal_takeaway'], // Max 5 types allowed
      languageCode: 'tr', // Turkish language preference
      locationBias: location ? {
        circle: {
          center: {
            latitude: parseFloat(location.split(',')[0]),
            longitude: parseFloat(location.split(',')[1])
          },
          radius: parseFloat(radius)
        }
      } : undefined,
    };

    // Make request to Google Places API (New)
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch from Google Places API', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the response to a simpler format
    const predictions = data.suggestions?.map((suggestion: any) => ({
      place_id: suggestion.placePrediction?.placeId,
      description: suggestion.placePrediction?.text?.text,
      structured_formatting: {
        main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text,
        secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text,
      }
    })) || [];

    return NextResponse.json({ predictions });

  } catch (error: any) {
    console.error('Error in places search API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
