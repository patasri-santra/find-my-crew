// GeoJSON stores [longitude, latitude]. Leaflet wants [latitude, longitude].
// Like DD/MM vs MM/DD dates: convert in ONE place so markers never land in the wrong country.
export const toLatLng = ([lng, lat]) => [lat, lng];