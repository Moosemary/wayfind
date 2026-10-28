import { searchPlaces } from './api.js';

// Pill-shaped search input with a suggestion list.
export function createSearchField(root, { placeholder, dot, onSelect, onFocus }) {
  root.innerHTML = `
    <span class="field-dot field-dot-${dot}"></span>
    <input type="text" autocomplete="off" spellcheck="false" placeholder="${placeholder}" aria-label="${placeholder}" />
    <button class="pill pill-small" type="button" title="Pick on map">Map</button>
    <ul class="suggestions" hidden></ul>
  `;
  const input = root.querySelector('input');
  const list = root.querySelector('.suggestions');
  const mapBtn = root.querySelector('button');
  let timer;
  let controller;

  const close = () => {
    list.hidden = true;
    list.innerHTML = '';
  };

  const render = (results) => {
    list.innerHTML = '';
    if (!results.length) return close();
    for (const r of results) {
      const li = document.createElement('li');
      li.textContent = r.label;
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = r.label;
        close();
        onSelect(r);
      });
      list.append(li);
    }
    list.hidden = false;
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    controller?.abort();
    const q = input.value.trim();
    if (q.length < 3) return close();
    timer = setTimeout(async () => {
      controller = new AbortController();
      try {
        render(await searchPlaces(q, controller.signal));
      } catch (e) {
        if (e.name !== 'AbortError') close();
      }
    }, 250);
  });
  input.addEventListener('blur', close);
  input.addEventListener('focus', () => onFocus?.());

  return {
    setValue: (v) => (input.value = v),
    setPicking: (on) => root.classList.toggle('picking', on),
    onPickClick: (fn) => mapBtn.addEventListener('click', fn),
  };
}
