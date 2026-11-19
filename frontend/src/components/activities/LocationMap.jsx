import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { markerIcon } from "../../utils/leafletIcon";
import { toLatLng } from "../../utils/geo";

export default function LocationMap({ coordinates }) {
  const position = toLatLng(coordinates);

  return (
    // `isolate` stops Leaflet's high z-index layers from sliding over the sticky navbar
    <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="isolate h-64 w-full rounded-2xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={markerIcon} />
    </MapContainer>
  );
}