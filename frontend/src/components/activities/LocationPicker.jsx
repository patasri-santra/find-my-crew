import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Loader2 } from "lucide-react";
import Button from "../common/Button";
import useGeolocation from "../../hooks/useGeolocation";
import { markerIcon } from "../../utils/leafletIcon";

const DEFAULT_CENTER = [20.5937, 78.9629]; // India overview; change for your market
const DEFAULT_ZOOM = 5;

const round = (n) => Number(n.toFixed(6));

function ClickToPlace({ onPick }) {
  useMapEvents({
    click: (event) => onPick({ lat: round(event.latlng.lat), lng: round(event.latlng.lng) }),
  });
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15);
  }, [map, target]);
  return null;
}

// value / onChange use { lat, lng }, which is Leaflet's own order, so there's no GeoJSON swap here
export default function LocationPicker({ value, onChange, error }) {
  const geo = useGeolocation();
  const [flyTarget, setFlyTarget] = useState(null);

  useEffect(() => {
    if (geo.coords) {
      onChange(geo.coords);
      setFlyTarget(geo.coords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.coords]);

  return (
    <div role="group" aria-labelledby="pin-label">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <p id="pin-label" className="text-sm font-semibold">
          Pin the meeting spot
        </p>
        <Button type="button" variant="outline" onClick={geo.request} disabled={geo.locating}>
          {geo.locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
          {geo.locating ? "Locating..." : "Use my current location"}
        </Button>
      </div>

      <MapContainer
        center={value ? [value.lat, value.lng] : DEFAULT_CENTER}
        zoom={value ? 15 : DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className={`isolate h-72 w-full rounded-2xl ${error ? "ring-2 ring-red-400" : ""}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPlace onPick={onChange} />
        <FlyTo target={flyTarget} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const { lat, lng } = event.target.getLatLng();
                onChange({ lat: round(lat), lng: round(lng) });
              },
            }}
          />
        )}
      </MapContainer>

      <p className="mt-2 text-xs text-ink/60">
        {value
          ? `Pin set at ${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}. Drag it or click elsewhere to adjust.`
          : "Click the map to drop a pin."}{" "}
        Choose a public meeting place, not your home.
      </p>
      {geo.error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {geo.error} You can still click the map to choose a spot.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}