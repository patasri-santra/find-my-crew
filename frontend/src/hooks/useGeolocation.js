import { useCallback, useState } from "react";

const MESSAGES = {
  1: "Location access was denied. Allow it in your browser settings to search near you.",
  2: "We couldn't work out your location. Please try again.",
  3: "Finding your location took too long. Please try again.",
};

// Only asks the browser for permission when request() is called (a button click), never on page load
export default function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support location.");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Rounded to 3 decimals (~100 m): a radius filter doesn't need your exact spot
        setCoords({
          lat: Number(position.coords.latitude.toFixed(3)),
          lng: Number(position.coords.longitude.toFixed(3)),
        });
        setLocating(false);
      },
      (err) => {
        setError(MESSAGES[err.code] || MESSAGES[2]);
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setError("");
  }, []);

  return { coords, locating, error, request, clear };
}