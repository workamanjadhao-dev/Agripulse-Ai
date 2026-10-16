import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, MapPin, Navigation, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

// Fix Leaflet default marker icon URL issue in React build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to center and auto-fit Leaflet map to markers smoothly
function AutoBoundsView({ center, zoom, markers }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();

        const valid = (markers || []).filter(
          m => m && typeof m.lat === 'number' && !isNaN(m.lat) && typeof m.lng === 'number' && !isNaN(m.lng)
        );

        if (valid.length > 1) {
          const bounds = L.latLngBounds(valid.map(m => [m.lat, m.lng]));
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        } else if (valid.length === 1) {
          map.setView([valid[0].lat, valid[0].lng], 12);
        } else if (center && typeof center[0] === 'number') {
          map.setView(center, zoom);
        }
      } catch (err) {
        console.warn('Map bounds fit warning:', err);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [markers, center, zoom, map]);

  return null;
}

/**
 * Google Maps Component with failure detection
 */
function GoogleMapsView({ center, zoom, markers, route, apiKey, onError }) {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    // Intercept Google Maps Auth Failure globally
    const prevAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      console.warn('Google Maps API authentication failed. Falling back to OpenStreetMap.');
      if (onError) onError('Google Maps key unauthorized or invalid');
    };

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return () => {
        window.gm_authFailure = prevAuthFailure;
      };
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => {
        if (onError) onError('Failed to load Google Maps script');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setIsLoaded(true));
      script.addEventListener('error', () => {
        if (onError) onError('Failed to load Google Maps script');
      });
    }

    return () => {
      window.gm_authFailure = prevAuthFailure;
    };
  }, [apiKey, onError]);

  // Map Initialization
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google || !window.google.maps) return;

    try {
      if (!mapInstanceRef.current) {
        const gCenter = { lat: center[0], lng: center[1] };
        const map = new window.google.maps.Map(mapRef.current, {
          center: gCenter,
          zoom: zoom,
          mapTypeId: 'terrain',
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }

      const bounds = new window.google.maps.LatLngBounds();
      const validMarkers = (markers || []).filter(
        m => m && typeof m.lat === 'number' && !isNaN(m.lat) && typeof m.lng === 'number' && !isNaN(m.lng)
      );

      validMarkers.forEach((m) => {
        const position = { lat: m.lat, lng: m.lng };
        bounds.extend(position);

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: m.title || 'Location',
          animation: window.google.maps.Animation.DROP,
        });

        const navUrl = m.navigationUrl || `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`;
        const contentString = `
          <div style="font-family: system-ui, sans-serif; max-width: 260px; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 9px; font-weight: 800; background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                ${m.badge || m.type || 'Verified'}
              </span>
              <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">${m.lat.toFixed(4)}°N, ${m.lng.toFixed(4)}°E</span>
            </div>
            <h4 style="font-weight: 800; font-size: 13px; color: #0f172a; margin: 0 0 4px 0;">${m.title}</h4>
            ${m.address ? `<p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">📍 ${m.address}</p>` : ''}
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; font-size: 11px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">${m.subtitle || ''}</span>
                <span style="font-weight: 800; color: #047857;">${m.price || ''}</span>
              </div>
              ${m.arrivals ? `<p style="font-size: 10px; margin: 2px 0 0; color: #64748b;">Arrivals: ${m.arrivals}</p>` : ''}
              ${m.detail ? `<p style="font-size: 10px; margin: 2px 0 0; color: #475569;">${m.detail}</p>` : ''}
            </div>
            <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #16a34a; color: #ffffff; padding: 7px 10px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 11px; margin-top: 6px;">
              🧭 Start GPS Navigation →
            </a>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({ content: contentString });
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      });

      if (route && route.length > 0) {
        const pathCoords = route.map(pt => ({ lat: pt[0], lng: pt[1] }));
        polylineRef.current = new window.google.maps.Polyline({
          path: pathCoords,
          geodesic: true,
          strokeColor: '#16a34a',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map,
        });
        pathCoords.forEach(pt => bounds.extend(pt));
      }

      if (validMarkers.length > 1) {
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      } else if (validMarkers.length === 1) {
        map.setCenter({ lat: validMarkers[0].lat, lng: validMarkers[0].lng });
        map.setZoom(12);
      } else if (center) {
        map.setCenter({ lat: center[0], lng: center[1] });
        map.setZoom(zoom);
      }
    } catch (err) {
      console.warn('Google Maps rendering error:', err);
      if (onError) onError(err.message);
    }
  }, [isLoaded, markers, route, center, zoom, onError]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200 flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Google Maps Satellite & Terrain Active
      </div>
    </div>
  );
}

/**
 * Universal Dual-Engine Map Component
 * Reliable Leaflet OpenStreetMap as default with instant GPS coordinates and pins,
 * plus optional Google Maps switch if valid API key is present.
 */
export const MapComponent = ({ center = [20.9374, 78.5000], zoom = 8, markers = [], route = null, height = 'h-96' }) => {
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [engine, setEngine] = useState('osm'); // 'osm' default guarantees 100% reliable rendering without API key failure
  const [googleError, setGoogleError] = useState(null);

  const validMarkers = (markers || []).filter(
    m => m && typeof m.lat === 'number' && !isNaN(m.lat) && typeof m.lng === 'number' && !isNaN(m.lng)
  );

  const handleGoogleError = (errMsg) => {
    setGoogleError(errMsg || 'Google Maps unavailable');
    setEngine('osm');
  };

  return (
    <div className={`w-full ${height} rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative bg-slate-100`}>
      {/* Map Engine Switcher Header Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200">
        <button
          type="button"
          onClick={() => setEngine('osm')}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            engine === 'osm'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="OpenStreetMap: High-speed, guaranteed uptime, accurate Indian GIS coordinates"
        >
          <Layers className="w-3 h-3" />
          <span>OpenStreetMap</span>
        </button>

        {googleApiKey && (
          <button
            type="button"
            onClick={() => {
              setGoogleError(null);
              setEngine('google');
            }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              engine === 'google'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Google Maps Terrain & Satellite"
          >
            <span>🗺️ Google Maps</span>
          </button>
        )}
      </div>

      {/* Engine Error Alert if Google Maps failed */}
      {googleError && (
        <div className="absolute top-14 right-3 z-20 max-w-xs bg-amber-50 text-amber-900 border border-amber-300 p-2 rounded-xl text-[10px] font-medium shadow-md flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Google Maps failed auth. Switched to OpenStreetMap.</span>
        </div>
      )}

      {/* RENDER ACTIVE ENGINE */}
      {engine === 'google' && googleApiKey ? (
        <GoogleMapsView
          center={center}
          zoom={zoom}
          markers={validMarkers}
          route={route}
          apiKey={googleApiKey}
          onError={handleGoogleError}
        />
      ) : (
        <>
          <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <AutoBoundsView center={center} zoom={zoom} markers={validMarkers} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Custom Markers */}
            {validMarkers.map((m, idx) => (
              <Marker key={m.id || idx} position={[m.lat, m.lng]}>
                <Popup>
                  <div className="p-1 space-y-1.5 min-w-[240px] max-w-[280px]">
                    {m.image && (
                      <img
                        src={m.image}
                        alt={m.title}
                        className="w-full h-24 object-cover rounded-lg mb-1.5 border border-slate-200"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="font-extrabold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded uppercase">
                        {m.badge || m.type || 'Verified Location'}
                      </span>
                      <span className="text-slate-400 font-mono">{m.lat.toFixed(4)}°N, {m.lng.toFixed(4)}°E</span>
                    </div>
                    <p className="font-extrabold text-xs text-slate-900 leading-tight">{m.title}</p>
                    {m.address && <p className="text-[10px] text-slate-600 leading-snug">📍 {m.address}</p>}
                    {m.landmark && <p className="text-[10px] text-sky-700 font-semibold">🚪 {m.landmark}</p>}
                    <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-600 font-medium text-[11px]">{m.subtitle}</span>
                        {m.price && <span className="font-extrabold text-agri-700">{m.price}</span>}
                      </div>
                      {m.arrivals && <p className="text-[10px] text-slate-500 mt-0.5">Arrivals: {m.arrivals}</p>}
                      {m.detail && <p className="text-[10px] text-slate-600 mt-0.5 font-medium">{m.detail}</p>}
                    </div>
                    {m.onAction && (
                      <button
                        type="button"
                        onClick={m.onAction}
                        className="w-full py-1.5 px-2 bg-agri-600 hover:bg-agri-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors mb-1 cursor-pointer"
                      >
                        {m.actionLabel || '⚡ Book Now'}
                      </button>
                    )}
                    <a
                      href={m.navigationUrl || `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                    >
                      🧭 Start Turn-by-Turn Navigation →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route Line if present */}
            {route && (
              <Polyline
                positions={route}
                color="#16a34a"
                weight={4}
                opacity={0.8}
                dashArray="8, 8"
              />
            )}
          </MapContainer>

          {/* Map Engine Indicator Badge */}
          <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-600 shadow-sm border border-slate-200 flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>OpenStreetMap High-Precision GIS Active</span>
          </div>
        </>
      )}
    </div>
  );
};
