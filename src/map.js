import mapboxgl from 'mapbox-gl';
import { token } from './api.js';
import { startMarkerEl, endMarkerEl } from './icons.js';

const YELLOW = '#ffd400';

// Mapbox Dark is restyled at runtime towards a flat dark grey palette.
function restyle(map) {
  for (const layer of map.getStyle().layers) {
    const { id, type } = layer;
    try {
      if (type === 'background') {
        map.setPaintProperty(id, 'background-color', '#1b1b1b');
      } else if (type === 'fill') {
        const color = /water/.test(id) ? '#111111' : /building/.test(id) ? '#262626' : '#1f1f1f';
        map.setPaintProperty(id, 'fill-color', color);
      } else if (type === 'line' && /road|bridge|tunnel|street|motorway|trunk/.test(id)) {
        map.setPaintProperty(id, 'line-color', /motorway|trunk|primary/.test(id) ? '#4a4a4a' : '#333333');
      } else if (type === 'symbol') {
        map.setPaintProperty(id, 'text-color', '#8a8a8a');
        map.setPaintProperty(id, 'text-halo-color', '#1b1b1b');
      }
    } catch {
      /* layer does not support this property, keep default */
    }
  }
}

export function createMap(container, { onClick }) {
  mapboxgl.accessToken = token;
  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [15, 62],
    zoom: 3.5,
    attributionControl: true,
  });
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

  const ready = new Promise((resolve) =>
    map.on('load', () => {
      restyle(map);
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'butt' },
        paint: { 'line-color': YELLOW, 'line-width': 4, 'line-dasharray': [3, 2] },
      });
      resolve();
    }),
  );

  map.on('click', (e) => onClick([e.lngLat.lng, e.lngLat.lat]));

  let startMarker;
  let endMarker;

  return {
    setPicking: (on) => (map.getCanvas().style.cursor = on ? 'crosshair' : ''),
    setStart(lngLat) {
      startMarker?.remove();
      startMarker = lngLat
        ? new mapboxgl.Marker({ element: startMarkerEl() }).setLngLat(lngLat).addTo(map)
        : null;
    },
    setEnd(lngLat) {
      endMarker?.remove();
      endMarker = lngLat
        ? new mapboxgl.Marker({ element: endMarkerEl(), anchor: 'bottom' }).setLngLat(lngLat).addTo(map)
        : null;
    },
    async setRoute(geometry) {
      await ready;
      map.getSource('route').setData(
        geometry
          ? { type: 'Feature', geometry, properties: {} }
          : { type: 'FeatureCollection', features: [] },
      );
      if (geometry) {
        const bounds = geometry.coordinates.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(geometry.coordinates[0], geometry.coordinates[0]),
        );
        map.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 80, right: 80 }, duration: 800 });
      }
    },
    flyTo: (lngLat) => map.flyTo({ center: lngLat, zoom: Math.max(map.getZoom(), 12) }),
  };
}
