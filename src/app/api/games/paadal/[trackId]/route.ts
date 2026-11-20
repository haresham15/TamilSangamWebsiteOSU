// src/app/api/games/paadal/[trackId]/route.ts
import { NextResponse } from "next/server";

export const revalidate = 86400; // Cache on Vercel Edge/Server for 24 hours

interface iTunesLookupResult {
  resultCount: number;
  results: Array<{
    trackId: number;
    trackName: string;
    collectionName?: string;
    artistName?: string;
    previewUrl?: string;
    artworkUrl100?: string;
    releaseDate?: string;
  }>;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await context.params;

  if (!trackId || !/^\d+$/.test(trackId)) {
    return NextResponse.json({ error: "Invalid track ID" }, { status: 400 });
  }

  try {
    const itunesUrl = `https://itunes.apple.com/lookup?id=${trackId}&country=IN`;
    const res = await fetch(itunesUrl, {
      next: { revalidate: 86400 },
      headers: {
        "User-Agent": "TamilSangamOSU-Arcade/1.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to query audio preview from iTunes" },
        { status: res.status }
      );
    }

    const data: iTunesLookupResult = await res.json();
    if (data.resultCount === 0 || !data.results[0]?.previewUrl) {
      return NextResponse.json(
        { error: "Audio preview not available for this track" },
        { status: 404 }
      );
    }

    const track = data.results[0];

    return NextResponse.json(
      {
        trackId: track.trackId,
        previewUrl: track.previewUrl,
        artworkUrl: track.artworkUrl100,
        releaseYear: track.releaseDate ? track.releaseDate.substring(0, 4) : undefined,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (err) {
    console.error("iTunes lookup error:", err);
    return NextResponse.json(
      { error: "Internal preview lookup error" },
      { status: 500 }
    );
  }
}
