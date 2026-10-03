'use client';
// The search-area map: where Aisle looks for shops, and how far.
//
// A real, interactive map: pinch or use the buttons to zoom, drag to pan,
// drag the pin or tap the map to move the search point, and reset it to the
// city centre. Everything the map does can also be done without it (the city
// picker, the radius slider and the list of shops), so it is a visual aid
// rather than the only way in. Keyboard: arrow keys pan the map; on the pin,
// they move the pin.
import {useEffect, useRef, useState} from 'react';
import {LocateFixed, MapPin, Minus, Plus, TriangleAlert} from 'lucide-react';
import type {Circle, LayerGroup, Map as LeafletMap, Marker} from 'leaflet';
import {Slider} from '@/components/ui/slider';
import {cityLocation, type SearchLocation} from '@/lib/locations';
import 'leaflet/dist/leaflet.css';
import './location-map.css';

export type MapShop = {id: string; name: string; lat: number; lng: number};

type Props = {
  city: string;
  location: SearchLocation;
  radius: number;
  onLocation: (point: SearchLocation) => void;
  /** Omit to show the area without a radius control (the radius is set elsewhere). */
  onRadius?: (radius: number) => void;
  /** Nearby shops to mark, from the shop directory. */
  shops?: MapShop[];
};

const env = (import.meta as unknown as {env?: Record<string, string | undefined>}).env ?? {};
/** A production build should point this at a tile provider it has an agreement
 *  with; OpenStreetMap's own servers are for light use (see docs/HANDOFF.md). */
const TILE_URL = env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  env.VITE_MAP_TILE_ATTRIBUTION ||
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

const PIN = `<svg viewBox="0 0 40 52" width="40" height="52" aria-hidden="true"><path d="M20 50.5S37.5 32.6 37.5 19.6a17.5 17.5 0 1 0-35 0C2.5 32.6 20 50.5 20 50.5Z" class="pin-body"/><circle cx="20" cy="19.6" r="6.8" class="pin-dot"/></svg>`;

const point = (lat: number, lng: number, city: string): SearchLocation => ({
  lat: Number(Math.max(-85, Math.min(85, lat)).toFixed(6)),
  lng: Number((((((lng + 180) % 360) + 360) % 360) - 180).toFixed(6)),
  city,
  custom: true,
});
const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase();

export default function LocationMap({city, location, radius, onLocation, onRadius, shops}: Props) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<{map: LeafletMap; marker: Marker; circle: Circle; shops: LayerGroup} | null>(
    null,
  );
  const latest = useRef({location, radius, onLocation, city});
  latest.current = {location, radius, onLocation, city};
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [zoom, setZoom] = useState(11);
  const [said, setSaid] = useState('');

  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    let created: LeafletMap | undefined;
    setReady(false);
    setError('');
    import('leaflet')
      .then(L => {
        if (disposed || !element.current) return;
        const start = latest.current;
        const m = L.map(element.current, {
          center: [start.location.lat, start.location.lng],
          zoom: 11,
          minZoom: 5,
          maxZoom: 18,
          zoomControl: false,
          scrollWheelZoom: false,
          touchZoom: true,
          dragging: true,
          keyboard: true,
          zoomSnap: 0.25,
          zoomAnimation: true,
          markerZoomAnimation: true,
          attributionControl: true,
        });
        created = m;
        m.attributionControl.setPrefix(false);
        const tiles = L.tileLayer(TILE_URL, {maxZoom: 19, attribution: TILE_ATTRIBUTION}).addTo(m);
        tiles.on('tileerror', () => {
          if (!disposed) setError('The map could not load. Check your connection and try again.');
        });
        tiles.on('tileload', () => {
          if (!disposed) setError('');
        });
        const centre = L.latLng(start.location.lat, start.location.lng);
        const circle = L.circle(centre, {
          radius: start.radius * 1000,
          className: 'map-radius-circle',
          interactive: false,
        }).addTo(m);
        const shopLayer = L.layerGroup().addTo(m);
        const marker = L.marker(centre, {
          draggable: true,
          autoPan: true,
          keyboard: true,
          title: 'Your search point',
          icon: L.divIcon({
            className: 'aisle-pin',
            html: PIN,
            iconSize: [40, 52],
            iconAnchor: [20, 51],
          }),
          zIndexOffset: 1000,
        }).addTo(m);

        const select = (lat: number, lng: number, announce = true) => {
          const next = point(lat, lng, latest.current.city);
          marker.setLatLng(next);
          circle.setLatLng(next);
          latest.current.onLocation(next);
          if (announce) setSaid('Search point moved.');
        };
        m.on('click', e => select(e.latlng.lat, e.latlng.lng));
        m.on('zoomend', () => setZoom(Math.round(m.getZoom() * 4) / 4));
        marker.on('dragstart', () => marker.getElement()?.classList.add('is-lifted'));
        marker.on('drag', () => circle.setLatLng(marker.getLatLng()));
        marker.on('dragend', () => {
          marker.getElement()?.classList.remove('is-lifted');
          const at = marker.getLatLng();
          select(at.lat, at.lng);
        });
        // The pin moves with the arrow keys when it has focus, so placing it
        // never depends on a drag.
        const pin = marker.getElement();
        if (pin) {
          pin.setAttribute('role', 'button');
          pin.setAttribute('aria-label', 'Search point. Use the arrow keys to move it.');
          pin.addEventListener('keydown', event => {
            const step = {
              ArrowUp: [0, -1],
              ArrowDown: [0, 1],
              ArrowLeft: [-1, 0],
              ArrowRight: [1, 0],
            }[event.key];
            if (!step) return;
            event.preventDefault();
            event.stopPropagation();
            const at = m.latLngToContainerPoint(marker.getLatLng());
            const next = m.containerPointToLatLng([at.x + step[0] * 24, at.y + step[1] * 24]);
            select(next.lat, next.lng);
          });
        }
        m.fitBounds(circle.getBounds(), {padding: [28, 28], animate: false});
        setZoom(Math.round(m.getZoom() * 4) / 4);
        map.current = {map: m, marker, circle, shops: shopLayer};
        resize = new ResizeObserver(() => m.invalidateSize({pan: false}));
        resize.observe(element.current);
        setReady(true);
      })
      .catch(cause => {
        console.warn('Map initialization failed:', cause);
        created?.remove();
        created = undefined;
        if (!disposed) setError('The map could not open. Try again.');
      });
    return () => {
      disposed = true;
      resize?.disconnect();
      created?.remove();
      map.current = null;
    };
  }, [retry]);

  // Follow changes made outside the map: a new city, or a new radius.
  useEffect(() => {
    const c = map.current;
    if (!c) return;
    c.marker.setLatLng(location);
    c.circle.setLatLng(location).setRadius(radius * 1000);
    if (!location.custom) c.map.setView(location, c.map.getZoom(), {animate: false});
    // Keyed on the coordinates, not the object: a new object with the same point
    // arrives on every render and would snap the map back while someone pans it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, location.lat, location.lng, location.custom, radius]);

  // A new radius brings the whole area into view.
  const firstRadius = useRef(true);
  useEffect(() => {
    if (firstRadius.current) {
      firstRadius.current = false;
      return;
    }
    const c = map.current;
    if (c) c.map.fitBounds(c.circle.getBounds(), {padding: [28, 28]});
  }, [radius]);

  // Shops are drawn as small marks; their names are listed beside the map.
  useEffect(() => {
    const c = map.current;
    if (!c) return;
    void import('leaflet').then(L => {
      c.shops.clearLayers();
      for (const shop of shops ?? [])
        L.marker([shop.lat, shop.lng], {
          interactive: false,
          keyboard: false,
          icon: L.divIcon({
            className: 'shop-mark',
            html: `<span>${initials(shop.name).replace(/[<>&"']/g, '')}</span>`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          }),
        }).addTo(c.shops);
    });
  }, [ready, shops]);

  const zoomBy = (delta: number) => map.current?.map.setZoom(map.current.map.getZoom() + delta);
  const reset = () => {
    const centre = cityLocation(city);
    onLocation(centre);
    const c = map.current;
    if (c) {
      c.marker.setLatLng(centre);
      c.circle.setLatLng(centre);
      c.map.fitBounds(c.circle.getBounds(), {padding: [28, 28]});
    }
    setSaid(`Search point reset to the centre of ${city}.`);
  };

  return (
    <section className="map-card" aria-label="Search area">
      <div className="map-stage" data-zoom={zoom}>
        <div
          ref={element}
          className="location-map"
          role="region"
          aria-label={`Map around ${city}. Tap the map or drag the pin to move your search point.`}
        />
        {!ready && !error && <div className="map-veil">Loading the map…</div>}
        {error && (
          <div className="map-veil is-error" role="status">
            <TriangleAlert size={20} />
            <span>{error}</span>
            <button type="button" className="button secondary" onClick={() => setRetry(v => v + 1)}>
              Try again
            </button>
          </div>
        )}
        <div className="map-controls">
          <div className="map-control-group">
            <button
              type="button"
              aria-label="Zoom in"
              disabled={!ready || zoom >= 18}
              onClick={() => zoomBy(1)}
            >
              <Plus size={20} />
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              disabled={!ready || zoom <= 5}
              onClick={() => zoomBy(-1)}
            >
              <Minus size={20} />
            </button>
          </div>
          <button
            type="button"
            className="map-control-single"
            aria-label={`Reset to the centre of ${city}`}
            disabled={!ready}
            onClick={reset}
          >
            <LocateFixed size={20} />
          </button>
        </div>
        <span className="map-place">
          <MapPin size={15} />
          {location.custom ? 'Your pin' : `${city} centre`}
        </span>
      </div>
      {onRadius && (
        <div className="map-radius">
          <div className="map-radius-head">
            <span>Search radius</span>
            <strong>{radius} km</strong>
          </div>
          <Slider
            className="location-slider"
            aria-label="Search radius in kilometres"
            min={1}
            max={25}
            step={1}
            value={[radius]}
            onValueChange={values => onRadius(values[0])}
          />
        </div>
      )}
      <p className="map-hint">Drag the pin or tap the map to move it. Pinch to zoom.</p>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
    </section>
  );
}
