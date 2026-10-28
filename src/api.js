const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const hasToken = Boolean(TOKEN);
export const token = TOKEN;

const GEOCODE = 'https://api.mapbox.com/search/geocode/v6';
const DIRECTIONS = 'https://api.mapbox.com/directions/v5/mapbox/driving';

const label = (f) => f.properties.full_address || f.properties.name_preferred || f.properties.name;

export async function searchPlaces(query, signal) {
  const url = `${GEOCODE}/forward?q=${encodeURIComponent(query)}&limit=5&access_token=${TOKEN}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return data.features.map((f) => ({ label: label(f), lngLat: f.geometry.coordinates }));
}

export async function reverseGeocode([lng, lat]) {
  const url = `${GEOCODE}/reverse?longitude=${lng}&latitude=${lat}&limit=1&access_token=${TOKEN}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.features[0] ? label(data.features[0]) : null;
  } catch {
    return null;
  }
}

export async function getRoute(from, to) {
  const coords = `${from.join(',')};${to.join(',')}`;
  const url = `${DIRECTIONS}/${coords}?geometries=geojson&overview=full&access_token=${TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not fetch route');
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error('No route found between these points');
  return { geometry: route.geometry, distance: route.distance, duration: route.duration };
}
