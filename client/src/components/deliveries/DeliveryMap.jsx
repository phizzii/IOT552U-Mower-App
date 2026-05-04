import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function isLatLng(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1]) &&
    value[0] >= -90 &&
    value[0] <= 90 &&
    value[1] >= -180 &&
    value[1] <= 180
  );
}

function normalizeLatLng(value) {
  if (Array.isArray(value) && value.length === 2) {
    const lat = Number(value[0]);
    const lng = Number(value[1]);

    if (isLatLng([lat, lng])) {
      return [lat, lng];
    }
  }

  if (value && typeof value === 'object') {
    const lat = Number(value.lat ?? value.latitude);
    const lng = Number(value.lng ?? value.longitude);

    if (isLatLng([lat, lng])) {
      return [lat, lng];
    }
  }

  return null;
}

function FitBounds({ bounds }) {
  const map = useMap();

  useEffect(() => {
    const validBounds = Array.isArray(bounds) ? bounds.filter(isLatLng) : [];
    if (validBounds.length === 0) {
      return;
    }

    if (validBounds.length === 1) {
      map.setView(validBounds[0], 12);
    } else {
      map.fitBounds(validBounds, { padding: [40, 40] });
    }
  }, [bounds, map]);

  return null;
}

function DeliveryMap({ routeTasks, startLocation, onRouteUpdate }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [routeLine, setRouteLine] = useState(null);
  const [routeError, setRouteError] = useState('');

  const normalizedStartLocation = useMemo(() => normalizeLatLng(startLocation), [startLocation]);

  const markers = useMemo(() => {
    const deliveryMarkers = routeTasks
      .map((task, index) => {
        const position = normalizeLatLng(task.latlng || task.position);
        if (!position) {
          return null;
        }

        return {
          ...task,
          position,
          label: `${index + 1}`,
          isStart: false,
        };
      })
      .filter(Boolean);

    if (normalizedStartLocation) {
      return [
        {
          taskId: 'route-start',
          position: normalizedStartLocation,
          label: 'S',
          isStart: true,
        },
        ...deliveryMarkers,
      ];
    }

    return deliveryMarkers;
  }, [routeTasks, normalizedStartLocation]);

  const bounds = useMemo(
    () => markers.filter((marker) => isLatLng(marker.position)).map((marker) => marker.position),
    [markers]
  );
  const mapCenter = useMemo(() => {
    const center = bounds.length ? bounds[0] : [51.505, -0.09];
    return isLatLng(center) ? center : [51.505, -0.09];
  }, [bounds]);

  useEffect(() => {
    if (!mapInstance) return;
    setTimeout(() => mapInstance.invalidateSize({ pan: true }), 50);
  }, [isFullscreen, mapInstance]);

  useEffect(() => {
    if (!normalizedStartLocation || routeTasks.length === 0) {
      setRouteLine(null);
      setRouteError('');
      if (onRouteUpdate) {
        onRouteUpdate(null);
      }
      return;
    }

    const waypoints = [
      normalizedStartLocation,
      ...routeTasks.map((task) => normalizeLatLng(task.latlng || task.position)),
    ];
    if (waypoints.some((point) => !isLatLng(point))) {
      setRouteLine(null);
      setRouteError('One or more route points are missing coordinates.');
      if (onRouteUpdate) {
        onRouteUpdate(null);
      }
      return;
    }

    const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    setRouteError('');
    console.log('Routing request:', url);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((body) => {
            throw new Error(body?.error || 'Traffic route request failed.');
          });
        }

        return response.json();
      })
      .then((payload) => {
        console.log('Routing response:', payload);
        if (!payload.routes || payload.routes.length === 0) {
          throw new Error('No route could be calculated.');
        }

        const route = payload.routes[0];
        const path = route.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]);
        if (!path || path.length === 0) {
          throw new Error('Invalid route geometry.');
        }

        setRouteLine(path);
        const summary = {
          distance: Number(route.distance || 0),
          duration: Number(route.duration || 0),
        };
        if (onRouteUpdate) {
          onRouteUpdate(summary);
        }
      })
      .catch((err) => {
        setRouteLine(null);
        setRouteError(err.message || 'Unable to calculate traffic-aware route.');
        if (onRouteUpdate) {
          onRouteUpdate(null);
        }
      });
  }, [routeTasks, normalizedStartLocation, onRouteUpdate]);

  useEffect(() => {
    if (!mapInstance || !isLatLng(mapCenter)) return;
    mapInstance.setView(mapCenter, 11);
  }, [mapCenter, mapInstance]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  return (
    <div className={`map-panel surface-card ${isFullscreen ? 'map-panel-fullscreen' : ''}`}>
      <div className="map-panel-header">
        <div>
          <p className="section-label">Route map</p>
          <h3 className="section-title">Delivery route preview</h3>
        </div>
        <button className="secondary-button" type="button" onClick={() => setIsFullscreen((current) => !current)}>
          {isFullscreen ? 'Exit full screen' : 'Full screen'}
        </button>
      </div>

      <div className="map-canvas map-canvas--leaflet">
        {!mapCenter || !isLatLng(mapCenter) ? (
          <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', color: '#666' }}>
            <p>Map loading...</p>
          </div>
        ) : (
          <MapContainer
            center={isLatLng(mapCenter) ? mapCenter : [51.505, -0.09]}
            zoom={11}
            minZoom={4}
            maxZoom={18}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
            whenCreated={setMapInstance}
          >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {bounds.length > 0 && <FitBounds bounds={bounds} />}
          {routeLine && Array.isArray(routeLine) && routeLine.length > 0 && (
            <Polyline positions={routeLine} pathOptions={{ color: '#2f5a2a', weight: 5, opacity: 0.85 }} />
          )}

          {markers.map((marker) => (
            <CircleMarker
              key={marker.taskId}
              center={marker.position}
              radius={marker.isStart ? 10 : 8}
              pathOptions={
                marker.isStart
                  ? { color: '#2f5a2a', fillColor: '#dff1de', fillOpacity: 1, weight: 3 }
                  : { color: '#275831', fillColor: '#eff7ec', fillOpacity: 1, weight: 3 }
              }
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                {marker.isStart ? 'Start' : marker.label}
              </Tooltip>
            </CircleMarker>
          ))}
          </MapContainer>
        )}
      </div>

      {routeError ? <div className="feedback-banner warning">{routeError}</div> : null}
      {isFullscreen && <div className="map-fullscreen-overlay" onClick={() => setIsFullscreen(false)} />}
    </div>
  );
}

export default DeliveryMap;
