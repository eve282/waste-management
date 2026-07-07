import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import { STATUS_META, PRIORITY_META, formatLabel } from "../../utils/status";

const markerIcon = (color, borderColor, selected) => {
  const size = selected ? 24 : 16;
  return L.divIcon({
    className: selected ? "pulsing-marker" : "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${
      selected ? 3 : 2
    }px solid ${selected ? "#fff" : borderColor};box-shadow:0 1px 3px rgba(0,0,0,0.5);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const searchCenterIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#dc2626;border:3px solid #fff;box-shadow:0 0 0 2px #dc2626,0 1px 4px rgba(0,0,0,0.6);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng);
    },
  });
  return null;
};

const FlyToSelected = ({ complaints, selectedId }) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const target = complaints.find((c) => c._id === selectedId);
    if (target) {
      map.flyTo([target.location.lat, target.location.lng], Math.max(map.getZoom(), 15), {
        duration: 0.75,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return null;
};

// complaints: array with { _id, location: {lat, lng}, category, status, priority }
const MapView = ({
  complaints = [],
  defaultCenter = [28.4744, 77.504],
  selectedId,
  onSelectComplaint,
  searchCenter,
  radiusKm,
  onMapClick,
}) => {
  const markerRefs = useRef({});

  useEffect(() => {
    if (selectedId && markerRefs.current[selectedId]) {
      markerRefs.current[selectedId].openPopup();
    }
  }, [selectedId]);

  return (
    <MapContainer center={defaultCenter} zoom={12} className="h-[420px] w-full rounded-xl">
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected complaints={complaints} selectedId={selectedId} />
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      {searchCenter && (
        <>
          <Marker position={[searchCenter.lat, searchCenter.lng]} icon={searchCenterIcon} />
          {radiusKm > 0 && (
            <Circle
              center={[searchCenter.lat, searchCenter.lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.08 }}
            />
          )}
        </>
      )}
      {complaints.map((c) => {
        const statusMeta = STATUS_META[c.status] || {};
        const priorityMeta = PRIORITY_META[c.priority] || {};
        const selected = c._id === selectedId;
        return (
          <Marker
            key={c._id}
            position={[c.location.lat, c.location.lng]}
            icon={markerIcon(statusMeta.hex || "#6c757d", priorityMeta.hex || "#333", selected)}
            eventHandlers={{ click: () => onSelectComplaint?.(c._id) }}
            ref={(ref) => {
              if (ref) markerRefs.current[c._id] = ref;
            }}
          >
            <Popup>
              <b className="capitalize">{formatLabel(c.category)}</b>
              <br />
              Status: {statusMeta.label}
              <br />
              Priority: {priorityMeta.label}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;
