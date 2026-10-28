export const startMarkerEl = () => {
  const el = document.createElement('div');
  el.className = 'marker marker-start';
  el.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#fff" stroke="#111" stroke-width="2"/></svg>';
  return el;
};

export const endMarkerEl = () => {
  const el = document.createElement('div');
  el.className = 'marker marker-end';
  el.innerHTML =
    '<svg width="32" height="42" viewBox="0 0 32 42"><path fill="#fff" fill-rule="evenodd" stroke="#111" stroke-width="1.5" d="M16 1.5C8 1.5 1.5 7.8 1.5 15.6 1.5 26 16 40.5 16 40.5S30.5 26 30.5 15.6C30.5 7.8 24 1.5 16 1.5zm0 6.5a7.6 7.6 0 1 1 0 15.2A7.6 7.6 0 0 1 16 8z"/></svg>';
  return el;
};
