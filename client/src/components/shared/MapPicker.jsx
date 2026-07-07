import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useRef, useState } from "react";
import L from "leaflet";
import Button from "../ui/Button";

// Fix default marker icon paths (a known react-leaflet + Vite quirk)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationSelector = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

// defaultCenter example: Greater Noida coordinates
const MapPicker = ({ defaultCenter = [28.4744, 77.504], onLocationChange }) => {
  const [position, setPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const mapRef = useRef(null);

  const handleSelect = (latlng) => {
    setPosition(latlng);
    setLocateError("");
    onLocationChange(latlng);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        handleSelect(latlng);
        mapRef.current?.flyTo(latlng, 16, { duration: 0.75 });
        setLocating(false);
      },
      (err) => {
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied - please allow access or click on the map instead."
            : "Couldn't get your location - please click on the map instead."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">📍 Click on the map to pin the complaint location</p>
        <Button type="button" variant="secondary" size="sm" loading={locating} onClick={handleUseMyLocation}>
          Use my current location
        </Button>
      </div>

      {locateError && <p className="mb-2 text-sm text-red-600">{locateError}</p>}

      <MapContainer
        center={defaultCenter}
        zoom={13}
        ref={mapRef}
        className="h-72 w-full rounded-xl border border-slate-200"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationSelector onSelect={handleSelect} />
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
};

export default MapPicker;
