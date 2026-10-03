"use client";

import { useEffect, useState } from "react";

const STATION_ART = "https://images.radio.co/station_logos/s83b3fe12f.20231001063451.jpg";

type TrackResponse = {
  data?: {
    artwork_urls?: {
      large?: string;
      standard?: string;
    };
  };
};

export default function NowPlayingArtwork() {
  const [artwork, setArtwork] = useState(STATION_ART);

  useEffect(() => {
    let active = true;

    const fetchArtwork = async () => {
      try {
        const response = await fetch("/api/now-playing", { cache: "no-store" });
        if (!response.ok) return;
        const result: TrackResponse = await response.json();
        const image = result.data?.artwork_urls?.large || result.data?.artwork_urls?.standard;
        if (active && image) setArtwork(image);
      } catch (error) {
        console.error("Unable to load current station artwork:", error);
      }
    };

    fetchArtwork();
    const interval = setInterval(fetchArtwork, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <img
      src={artwork}
      alt="Current Zero FM track artwork"
      className="absolute inset-0 size-full object-cover"
      onError={() => setArtwork(STATION_ART)}
    />
  );
}