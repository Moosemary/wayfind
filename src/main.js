import 'mapbox-gl/dist/mapbox-gl.css';
import './style.css';
import { hasToken, getRoute, reverseGeocode } from './api.js';
import { createMap } from './map.js';
import { createSearchField } from './search.js';

const messageEl = document.getElementById('message');
const summaryEl = document.getElementById('summary');

const showMessage = (text) => {
  messageEl.textContent = text || '';
  messageEl.hidden = !text;
};

if (!hasToken) {
  showMessage('Missing Mapbox token. Set VITE_MAPBOX_TOKEN in .env.local and restart.');
  throw new Error('VITE_MAPBOX_TOKEN is not set');
}

const state = { from: null, to: null, picking: null };
let routeRequest = 0;

const map = createMap('map', { onClick: handleMapClick });

const fromField = createSearchField(document.getElementById('field-from'), {
  placeholder: 'From',
  dot: 'from',
  onSelect: (r) => setPoint('from', r.lngLat, true),
});
const toField = createSearchField(document.getElementById('field-to'), {
  placeholder: 'To',
  dot: 'to',
  onSelect: (r) => setPoint('to', r.lngLat, true),
});
const fields = { from: fromField, to: toField };

function setPicking(which) {
  state.picking = state.picking === which ? null : which;
  fromField.setPicking(state.picking === 'from');
  toField.setPicking(state.picking === 'to');
  map.setPicking(Boolean(state.picking));
}
fromField.onPickClick(() => setPicking('from'));
toField.onPickClick(() => setPicking('to'));

function setPoint(which, lngLat, fly = false) {
  state[which] = lngLat;
  which === 'from' ? map.setStart(lngLat) : map.setEnd(lngLat);
  if (fly && !(state.from && state.to)) map.flyTo(lngLat);
  updateRoute();
}

async function handleMapClick(lngLat) {
  // Explicit pick mode wins; otherwise fill From, then To, then move To.
  const which = state.picking || (!state.from ? 'from' : 'to');
  if (state.picking) setPicking(state.picking);
  setPoint(which, lngLat);
  fields[which].setValue('Locating…');
  const name = await reverseGeocode(lngLat);
  fields[which].setValue(name || `${lngLat[1].toFixed(5)}, ${lngLat[0].toFixed(5)}`);
}

const formatDistance = (m) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`);
const formatDuration = (s) => {
  const mins = Math.max(1, Math.round(s / 60));
  const h = Math.floor(mins / 60);
  return h ? `${h} h ${mins % 60} min` : `${mins} min`;
};

async function updateRoute() {
  const id = ++routeRequest;
  showMessage('');
  if (!state.from || !state.to) {
    summaryEl.hidden = true;
    map.setRoute(null);
    return;
  }
  try {
    const route = await getRoute(state.from, state.to);
    if (id !== routeRequest) return;
    map.setRoute(route.geometry);
    document.getElementById('distance').textContent = formatDistance(route.distance);
    document.getElementById('duration').textContent = formatDuration(route.duration);
    summaryEl.hidden = false;
  } catch (e) {
    if (id !== routeRequest) return;
    summaryEl.hidden = true;
    map.setRoute(null);
    showMessage(e.message);
  }
}

document.getElementById('swap').addEventListener('click', () => {
  const inputs = document.querySelectorAll('.field input');
  [inputs[0].value, inputs[1].value] = [inputs[1].value, inputs[0].value];
  [state.from, state.to] = [state.to, state.from];
  map.setStart(state.from);
  map.setEnd(state.to);
  updateRoute();
});

document.getElementById('clear').addEventListener('click', () => {
  state.from = state.to = null;
  fromField.setValue('');
  toField.setValue('');
  map.setStart(null);
  map.setEnd(null);
  updateRoute();
});
