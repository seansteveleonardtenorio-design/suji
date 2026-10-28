(() => {
'use strict';
const $ = (id) => document.getElementById(id);
if (typeof L === 'undefined') {
  $('map').innerHTML = '<p style="padding:24px;color:#a73636">The map library could not load. Check your internet connection and reload.</p>';
  return;
}

const K = { m: 'palawan-gis-markers', v: 'palawan-gis-view', b: 'palawan-gis-base' };
const HOME = [[7.7, 116.8], [12.6, 120.6]];
const CATS = { general: ['General', '#2f8f64'], site: ['Site / camp', '#e6a23d'], water: ['Water', '#2b7fc2'], food: ['Food & stay', '#8e5bd0'], hazard: ['Hazard', '#c0453a'] };
const PLACES = [['Puerto Princesa', 9.7392, 118.7353, 12], ['El Nido', 11.1784, 119.3939, 13], ['Coron', 11.9986, 120.2043, 13], ['Taytay', 10.8264, 119.5206, 13], ['San Vicente', 10.5262, 119.2815, 12], ['Balabac', 7.9860, 117.0636, 11]];
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const f5 = (n) => Number(n).toFixed(5);
const dms = (v, p, n) => { const a = Math.abs(v), d = Math.floor(a), m = Math.floor((a - d) * 60), s = ((a - d) * 60 - m) * 60; return d + '°' + m + '′' + s.toFixed(1) + '″' + (v >= 0 ? p : n); };
const fDist = (m) => (m >= 1000 ? (m / 1000).toFixed(2) + ' km' : Math.round(m) + ' m');
const valid = (la, ln) => isFinite(la) && isFinite(ln) && Math.abs(la) <= 90 && Math.abs(ln) <= 180;
const fArea = (a) => (a >= 1e6 ? (a / 1e6).toFixed(2) + ' km²' : a >= 1e4 ? (a / 1e4).toFixed(2) + ' ha' : Math.round(a) + ' m²');

/* ---------- Map (tuned for smooth panning and zooming) ---------- */
const map = L.map('map', {
  preferCanvas: true,          // vector shapes drawn on one canvas = much faster
  zoomControl: false,
  zoomSnap: 0.5, zoomDelta: 0.5,
  wheelPxPerZoomLevel: 100, wheelDebounceTime: 25,
  minZoom: 5, maxBounds: [[-5, 105], [25, 135]], maxBoundsViscosity: 0.8,
});
const tl = (u, o) => L.tileLayer(u, Object.assign({ maxZoom: 19, updateWhenIdle: false, updateWhenZooming: false, keepBuffer: 4, referrerPolicy: 'origin' }, o));
const base = {
  'Street': tl('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }),
  'Clean': tl('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 16, attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors' }),
  'Satellite': tl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 17, maxZoom: 21, attribution: 'Imagery &copy; Esri' }),
  'Terrain': tl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 17, attribution: 'Terrain &copy; Esri, HERE, Garmin, USGS, &copy; OpenStreetMap contributors' }),
};
let curBase = store.get(K.b, 'Street');
if (!base[curBase]) curBase = 'Street';
base[curBase].addTo(map);
L.control.layers(base, null, { position: 'topright', collapsed: true }).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
map.on('baselayerchange', (e) => { curBase = e.name; store.set(K.b, e.name); });

// Brighten the satellite imagery as you zoom in (0 at zoom 15, full strength at zoom 19).
function tuneSat() {
  const el = base.Satellite.getContainer && base.Satellite.getContainer();
  if (!el) return;
  const t = Math.min(Math.max((map.getZoom() - 15) / 4, 0), 1);
  el.style.filter = 'brightness(' + (1 + 0.3 * t).toFixed(2) + ') contrast(' + (1 + 0.15 * t).toFixed(2) + ') saturate(' + (1 + 0.2 * t).toFixed(2) + ')';
}
map.on('zoom zoomend baselayerchange layeradd', tuneSat);
tuneSat();

// If OpenStreetMap tiles keep failing, fall back to the Clean (Esri light gray) tiles automatically.
let tileErr = 0;
base.Street.on('tileerror', () => {
  if (++tileErr === 4 && curBase === 'Street') { map.removeLayer(base.Street); base.Clean.addTo(map); curBase = 'Clean'; toast('Street tiles are slow, switched to the Clean map.'); }
});

const v0 = store.get(K.v);
if (v0 && v0.c) map.setView(v0.c, v0.z); else map.fitBounds(HOME);
map.on('moveend', () => { const c = map.getCenter(); store.set(K.v, { c: [c.lat, c.lng], z: map.getZoom() }); });

// Only recalculate size when the layout really changes (not on every frame).
let rz; const fix = () => { clearTimeout(rz); rz = setTimeout(() => map.invalidateSize({ animate: false }), 120); };
window.addEventListener('load', fix); window.addEventListener('orientationchange', fix); window.addEventListener('resize', fix);

/* ---------- Pins: the tip of the pin sits exactly on the coordinate ---------- */
const pin = (c) => L.divIcon({
  className: 'pin', iconSize: [32, 42], iconAnchor: [16, 41], popupAnchor: [0, -38],
  html: '<svg viewBox="0 0 32 42" width="32" height="42"><path d="M16 41S2 26 2 15a14 14 0 0 1 28 0c0 11-14 26-14 26z" fill="' + c + '" stroke="#fff" stroke-width="2.5"/><circle cx="16" cy="15" r="5" fill="#fff"/></svg>',
});

/* ---------- HUD / toast ---------- */
let hr, hl;
function hud(ll) { hl = ll || hl || map.getCenter(); if (hr) return; hr = requestAnimationFrame(() => { hr = 0; $('hud').textContent = f5(hl.lat) + ', ' + f5(hl.lng) + '   ·   zoom ' + map.getZoom(); }); }
map.on('mousemove', (e) => hud(e.latlng)); map.on('zoomend', () => hud());
let tt; function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2600); }

/* ---------- Selected point ---------- */
let sel = null, selM = null, asDMS = false, et;
function showSel() {
  if (!sel) return;
  $('lat').textContent = asDMS ? dms(sel.lat, 'N', 'S') : f5(sel.lat) + '°';
  $('lng').textContent = asDMS ? dms(sel.lng, 'E', 'W') : f5(sel.lng) + '°';
  $('fmtBtn').textContent = asDMS ? 'Show as decimal' : 'Show as DMS';
  const la = f5(sel.lat), ln = f5(sel.lng);
  const set = (id, href) => { const a = $(id); a.hidden = false; a.href = href; };
  set('gmaps', 'https://www.google.com/maps?q=' + la + ',' + ln);
  set('gsv', 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + la + ',' + ln);
  set('mly', 'https://www.mapillary.com/app/?lat=' + la + '&lng=' + ln + '&z=17');
  set('osm', 'https://www.openstreetmap.org/?mlat=' + la + '&mlon=' + ln + '#map=18/' + la + '/' + ln);
}

// Place name lookup (OpenStreetMap Nominatim reverse), cached per coordinate
const pc = new Map();
function lookup(ll) {
  const k = f5(ll.lat) + ',' + f5(ll.lng);
  if (!pc.has(k)) {
    pc.set(k, fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=' + f5(ll.lat) + '&lon=' + f5(ll.lng), { headers: { Accept: 'application/json' } })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => {
        const a = d.address || {};
        const street = a.road || a.pedestrian || a.path || a.footway;
        const area = a.neighbourhood || a.suburb || a.village || a.hamlet;
        const town = a.city || a.town || a.municipality || a.county;
        const short = [d.name && d.name !== street ? d.name : '', street, area, town].filter(Boolean).join(', ');
        return { short: short || d.display_name || '', name: d.name || street || area || town || '' };
      })
      .catch((e) => { pc.delete(k); throw e; }));
  }
  return pc.get(k);
}
let rtok = 0;
async function reverse(ll) {
  const t = ++rtok; $('addr').textContent = '…';
  try {
    const p = await lookup(ll);
    if (t !== rtok) return;
    if (sel) sel.place = p.short;
    $('addr').textContent = p.short || 'No place name found here';
  } catch { if (t === rtok) $('addr').textContent = 'Not available'; }
}
function selectPoint(ll, label) {
  sel = { lat: ll.lat, lng: ll.lng };
  showSel();
  let near = '';
  if (markers.length) {
    let b = null, bd = Infinity;
    markers.forEach((m) => { const d = map.distance(ll, [m.lat, m.lng]); if (d > 1 && d < bd) { bd = d; b = m; } });
    if (b) near = ' Nearest pin: ' + b.name + ' (' + fDist(bd) + ').';
  }
  $('hint').textContent = (label || 'Selected point on the map.') + near;
  if (selM) selM.setLatLng(ll);
  else selM = L.marker(ll, { icon: pin('#e6a23d'), interactive: false, keyboard: false, zIndexOffset: 900 }).addTo(map);
  $('elev').textContent = '…'; clearTimeout(et);
  et = setTimeout(async () => {
    reverse(ll);
    try {
      const r = await fetch('https://api.open-meteo.com/v1/elevation?latitude=' + f5(ll.lat) + '&longitude=' + f5(ll.lng));
      const d = await r.json(); $('elev').textContent = Math.round(d.elevation[0]) + ' m';
    } catch { $('elev').textContent = '—'; }
  }, 450);
}
$('fmtBtn').onclick = () => { asDMS = !asDMS; showSel(); };
$('pinSelBtn').onclick = () => (sel ? openDialog(sel) : toast('Pick a point on the map first.'));
$('copyBtn').onclick = async () => {
  if (!sel) return toast('Pick a point on the map first.');
  const t = f5(sel.lat) + ', ' + f5(sel.lng);
  try { await navigator.clipboard.writeText(t); } catch {
    const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); } catch {} a.remove();
  }
  toast('Copied ' + t);
};

/* ---------- Modes: add pin / measure ---------- */
let mode = null, mp = [], ml = null;
function setMode(m) {
  mode = m;
  $('map').style.cursor = m ? 'crosshair' : '';
  $('addBtn').setAttribute('aria-pressed', m === 'add');
  $('measureBtn').setAttribute('aria-pressed', m === 'measure');
  $('radiusBtn').setAttribute('aria-pressed', m === 'radius');
  $('banner').hidden = m !== 'measure';
  if (m === 'measure') { clearMeasure(); drawMeasure(); }
  if (m === 'add') toast('Click the map where the pin should go.');
  if (m === 'radius') toast('Click the map to check a radius around that point.');
}
function clearMeasure() { mp = []; if (ml) { map.removeLayer(ml); ml = null; } map.closePopup(); }
function areaOf(p) {
  const l0 = p.reduce((s, q) => s + q.lat, 0) / p.length, k = Math.cos(l0 * Math.PI / 180) * 111320;
  const xy = p.map((q) => [q.lng * k, q.lat * 110574]); let a = 0;
  xy.forEach((q, i) => { const r = xy[(i + 1) % xy.length]; a += q[0] * r[1] - r[0] * q[1]; });
  return Math.abs(a / 2);
}
function drawMeasure() {
  if (ml) map.removeLayer(ml);
  ml = L.layerGroup().addTo(map);
  if (mp.length > 2) L.polygon(mp, { stroke: false, fillColor: '#123d35', fillOpacity: 0.12, interactive: false }).addTo(ml);
  if (mp.length > 1) L.polyline(mp, { color: '#123d35', weight: 3, dashArray: '6 6', interactive: false }).addTo(ml);
  mp.forEach((q) => L.circleMarker(q, { radius: 5, color: '#fff', weight: 2, fillColor: '#123d35', fillOpacity: 1, interactive: false }).addTo(ml));
  const d = mp.reduce((s, q, i) => (i ? s + map.distance(mp[i - 1], q) : 0), 0);
  let t = 'Click the map to start measuring.';
  if (mp.length === 1) t = 'Click the next point.';
  if (mp.length > 1) t = 'Distance ' + fDist(d) + (mp.length > 2 ? '  ·  Area ≈ ' + fArea(areaOf(mp)) : '');
  $('btext').textContent = t;
  if (mp.length > 1) L.popup({ autoPan: false, closeButton: false }).setLatLng(mp[mp.length - 1]).setContent('<strong>' + fDist(d) + '</strong>').openOn(map);
}
let rl = null;
function clearRadius() { if (rl) { map.removeLayer(rl); rl = null; } }
function drawRadius(ll) {
  const km = parseFloat($('rKm').value);
  if (!(km >= 0.1 && km <= 500)) return toast('Enter a radius between 0.1 and 500 km.');
  clearRadius(); const r = km * 1000;
  rl = L.layerGroup().addTo(map);
  L.circle(ll, { radius: r, color: '#e6a23d', weight: 2, fillOpacity: 0.1, interactive: false }).addTo(rl);
  L.circleMarker(ll, { radius: 5, color: '#fff', weight: 2, fillColor: '#e6a23d', fillOpacity: 1, interactive: false }).addTo(rl);
  const inside = markers.filter((m) => map.distance(ll, [m.lat, m.lng]) <= r);
  map.flyToBounds(L.latLng(ll).toBounds(r * 2), { padding: [30, 30], duration: 0.8 });
  L.popup({ autoPan: false }).setLatLng(ll).setContent('<strong>' + km + ' km radius</strong><br>' + inside.length + ' of ' + markers.length + ' pins inside' +
    (inside.length ? '<br><small>' + inside.map((m) => esc(m.name)).join(', ') + '</small>' : '')).openOn(map);
}
$('radiusBtn').onclick = () => setMode(mode === 'radius' ? null : 'radius');
$('clearDrawBtn').onclick = () => { setMode(null); clearMeasure(); clearRadius(); map.closePopup(); toast('Drawings cleared.'); };
$('addBtn').onclick = () => setMode(mode === 'add' ? null : 'add');
$('measureBtn').onclick = () => setMode(mode === 'measure' ? null : 'measure');
$('doneBtn').onclick = () => setMode(null);
$('undoBtn').onclick = () => { mp.pop(); drawMeasure(); };
$('resetBtn').onclick = () => { setMode(null); clearMeasure(); map.flyToBounds(HOME, { duration: 1.2 }); };
$('fitBtn').onclick = () => (markers.length ? map.flyToBounds(markers.map((m) => [m.lat, m.lng]), { padding: [60, 60], maxZoom: 15, duration: 1 }) : toast('No pins saved yet.'));

map.on('click', (e) => {
  if (mode === 'measure') { mp.push(e.latlng); drawMeasure(); return; }
  if (mode === 'radius') { drawRadius(e.latlng); return; }
  selectPoint(e.latlng);
  if (mode === 'add') openDialog(e.latlng);
});
map.on('contextmenu', (e) => { selectPoint(e.latlng); openDialog(e.latlng); });

/* ---------- Saved pins ---------- */
let markers = Array.isArray(store.get(K.m, [])) ? store.get(K.m, []) : [];
const layers = new Map();
const catOf = (m) => CATS[m.cat] || CATS.general;
const commit = () => { store.set(K.m, markers); render(); };
function popupHtml(m) {
  return '<strong>' + esc(m.name) + '</strong><br><small>' + esc(catOf(m)[0]) + '</small>' + (m.note ? '<br>' + esc(m.note) : '') +
    (m.place ? '<br><small>' + esc(m.place) + '</small>' : '') +
    '<br><small>' + f5(m.lat) + ', ' + f5(m.lng) + '</small>';
}
function addLayer(m) {
  const l = L.marker([m.lat, m.lng], { icon: pin(catOf(m)[1]), title: m.name, riseOnHover: true }).bindPopup(popupHtml(m)).addTo(map);
  layers.set(m.id, l);
}
function addPin(m) {
  m.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  markers.push(m); addLayer(m); return m;
}
function render() {
  $('count').textContent = markers.length;
  const list = $('list'); list.innerHTML = '';
  if (!markers.length) { list.innerHTML = '<p class="empty">No pins yet. Use “Add pin”, right-click the map, or hold on a phone.</p>'; return; }
  markers.forEach((m) => {
    const r = document.createElement('div'); r.className = 'mi';
    r.innerHTML = '<span class="dot" style="background:' + catOf(m)[1] + '"></span><button type="button" class="m"><strong>' + esc(m.name) + '</strong><small>' + esc(m.place || (f5(m.lat) + ', ' + f5(m.lng))) + '</small></button><button type="button" class="x" aria-label="Delete ' + esc(m.name) + '">×</button>';
    r.querySelector('.m').onclick = () => {
      map.flyTo([m.lat, m.lng], Math.max(map.getZoom(), 14), { duration: 1 });
      const l = layers.get(m.id); if (l) setTimeout(() => l.openPopup(), 700);
      selectPoint({ lat: m.lat, lng: m.lng }, 'Saved pin: ' + m.name);
    };
    r.querySelector('.x').onclick = () => {
      const l = layers.get(m.id); if (l) map.removeLayer(l);
      layers.delete(m.id); markers = markers.filter((x) => x.id !== m.id); commit(); toast('Pin deleted.');
    };
    list.appendChild(r);
  });
}
$('clearBtn').onclick = () => {
  if (!markers.length) return toast('There are no pins to clear.');
  if (!confirm('Delete all ' + markers.length + ' saved pins?')) return;
  layers.forEach((l) => map.removeLayer(l)); layers.clear(); markers = []; commit(); toast('All pins cleared.');
};
$('exportBtn').onclick = () => {
  if (!markers.length) return toast('No pins to export yet.');
  const gj = { type: 'FeatureCollection', features: markers.map((m) => ({ type: 'Feature', properties: { name: m.name, note: m.note || '', category: m.cat || 'general', place: m.place || '' }, geometry: { type: 'Point', coordinates: [m.lng, m.lat] } })) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(gj, null, 2)], { type: 'application/geo+json' }));
  a.download = 'palawan-pins.geojson'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Exported ' + markers.length + ' pins.');
};
$('importBtn').onclick = () => $('importFile').click();
let ov = null;
$('importFile').onchange = async (e) => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  try {
    const g = JSON.parse(await file.text());
    const feats = g.type === 'FeatureCollection' ? g.features : g.type === 'Feature' ? [g] : [];
    if (!Array.isArray(feats) || !feats.length) throw new Error('empty');
    let n = 0; const other = [];
    feats.forEach((ft) => {
      if (!ft || !ft.geometry) return;
      if (ft.geometry.type !== 'Point') { other.push(ft); return; }
      const [lng, lat] = ft.geometry.coordinates, p = ft.properties || {};
      if (!valid(+lat, +lng)) return;
      addPin({ name: String(p.name || 'Imported pin').slice(0, 60), note: String(p.note || '').slice(0, 240), cat: CATS[p.category] ? p.category : 'general', place: String(p.place || '').slice(0, 160), lat: +lat, lng: +lng }); n++;
    });
    if (n) commit();
    if (other.length) {
      if (ov) map.removeLayer(ov);
      ov = L.geoJSON({ type: 'FeatureCollection', features: other }, {
        style: { color: '#6a3fb5', weight: 3, fillOpacity: 0.15 },
        onEachFeature: (f, l) => { const t = (f.properties || {}).name; if (t) l.bindPopup('<strong>' + esc(t) + '</strong>'); },
      }).addTo(map);
      $('clearLayerBtn').hidden = false;
      const b = ov.getBounds(); if (b.isValid()) map.flyToBounds(b, { padding: [40, 40], maxZoom: 15 });
    }
    toast('Imported ' + n + ' pins' + (other.length ? ' and ' + other.length + ' line/area features.' : '.'));
  } catch { toast('That file could not be read as GeoJSON.'); }
};
$('clearLayerBtn').onclick = () => { if (ov) map.removeLayer(ov); ov = null; $('clearLayerBtn').hidden = true; toast('Imported layer removed.'); };
$('csvBtn').onclick = () => {
  if (!markers.length) return toast('No pins to export yet.');
  const q = (v) => { let s = String(v); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const rows = ['name,category,place,latitude,longitude,note'].concat(markers.map((m) => [q(m.name), q(catOf(m)[0]), q(m.place || ''), m.lat, m.lng, q(m.note || '')].join(',')));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv' }));
  a.download = 'palawan-pins.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Exported ' + markers.length + ' pins to CSV.');
};

/* ---------- Pin dialog (looks up the place name and pre-fills the name) ---------- */
let pending = null;
$('pCat').innerHTML = Object.entries(CATS).map(([k, v]) => '<option value="' + k + '">' + v[0] + '</option>').join('');
function openDialog(ll) {
  pending = { lat: ll.lat, lng: ll.lng, place: '' };
  $('dc').textContent = f5(ll.lat) + ', ' + f5(ll.lng);
  $('dform').reset(); $('dPlace').textContent = 'Finding place name…';
  $('dlg').showModal(); setTimeout(() => $('pName').focus(), 30);
  lookup(ll).then((p) => {
    if (!pending || pending.lat !== ll.lat || pending.lng !== ll.lng) return;
    pending.place = p.short;
    $('dPlace').textContent = p.short || 'No place name found';
    if (!$('pName').value) $('pName').value = p.name;
  }).catch(() => { if (pending) $('dPlace').textContent = 'Place name not available'; });
}
$('dCancel').onclick = () => $('dlg').close();
$('dlg').addEventListener('mousedown', (e) => { if (e.target === $('dlg')) $('dlg').close(); });
$('dlg').addEventListener('close', () => { pending = null; if (mode === 'add') setMode(null); });
$('dform').onsubmit = (e) => {
  e.preventDefault(); if (!pending) return;
  const m = addPin({ name: $('pName').value.trim() || 'Untitled pin', note: $('pNote').value.trim(), cat: $('pCat').value, lat: pending.lat, lng: pending.lng, place: pending.place });
  commit(); $('dlg').close(); layers.get(m.id).openPopup(); toast('Pin saved.');
};

/* ---------- Search (OpenStreetMap Nominatim, biased to Palawan) ---------- */
let ab, lastQ = 0;
function goTo(r) {
  const ll = { lat: +r.lat, lng: +r.lon };
  if (r.boundingbox) { const [s, n, w, e] = r.boundingbox.map(Number); map.flyToBounds([[s, w], [n, e]], { maxZoom: 16, duration: 1.2 }); } else map.flyTo(ll, 14);
  selectPoint(ll, r.display_name);
}
$('sForm').onsubmit = async (e) => {
  e.preventDefault();
  const q = $('sIn').value.trim(); if (!q) return;
  if (Date.now() - lastQ < 1100) return toast('Please wait a second between searches.');
  lastQ = Date.now();
  if (ab) ab.abort(); ab = new AbortController();
  $('sRes').innerHTML = ''; $('sMsg').textContent = 'Searching…';
  try {
    const res = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=ph&viewbox=116.8,12.6,120.6,7.7&q=' + encodeURIComponent(q), { signal: ab.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    if (!data.length) { $('sMsg').textContent = 'No places found. Try another spelling or a nearby town.'; return; }
    $('sMsg').textContent = data.length + ' result' + (data.length > 1 ? 's' : '') + '. Choose one:';
    data.forEach((r) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = r.display_name; b.onclick = () => goTo(r); $('sRes').appendChild(b); });
  } catch (err) { if (err.name !== 'AbortError') $('sMsg').textContent = 'Search failed. Check your connection and try again.'; }
};
PLACES.forEach(([n, la, ln, z]) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = n;
  b.onclick = () => { map.flyTo([la, ln], z, { duration: 1.4 }); selectPoint({ lat: la, lng: ln }, n); };
  $('chips').appendChild(b);
});

/* ---------- Go to coordinates ---------- */
function parseCoords(s) {
  const d = s.match(/^\s*(-?\d+(?:\.\d+)?)[\s,;]+(-?\d+(?:\.\d+)?)\s*$/);
  if (d) return [+d[1], +d[2]];
  let la = NaN, ln = NaN, m; const re = /([^NSEWnsew]+)([NSEWnsew])/g;
  while ((m = re.exec(s))) {
    const a = (m[1].match(/\d+(?:\.\d+)?/g) || []).map(Number); if (!a.length) continue;
    let v = a[0] + (a[1] || 0) / 60 + (a[2] || 0) / 3600; const h = m[2].toUpperCase();
    if (h === 'S' || h === 'W') v = -v;
    if (h === 'N' || h === 'S') la = v; else ln = v;
  }
  return [la, ln];
}
$('gForm').onsubmit = (e) => {
  e.preventDefault();
  const [la, ln] = parseCoords($('gIn').value);
  if (!valid(la, ln)) { $('gMsg').textContent = 'Could not read that. Latitude comes first (−90 to 90), then longitude.'; return; }
  $('gMsg').textContent = 'Jumped to ' + f5(la) + ', ' + f5(ln) + '.';
  map.flyTo([la, ln], Math.max(map.getZoom(), 14), { duration: 1.2 }); selectPoint({ lat: la, lng: ln }, 'Typed coordinates.');
};

/* ---------- My location (keeps refining until accurate) ---------- */
let wid = null, wt, accC = null, dotC = null;
$('locBtn').onclick = () => {
  if (!navigator.geolocation) return toast('This browser does not support location.');
  if (wid !== null) navigator.geolocation.clearWatch(wid); clearTimeout(wt);
  toast('Finding your location…'); let first = true;
  const stop = () => { if (wid !== null) navigator.geolocation.clearWatch(wid); wid = null; clearTimeout(wt); };
  wid = navigator.geolocation.watchPosition((p) => {
    const ll = { lat: p.coords.latitude, lng: p.coords.longitude }, acc = Math.round(p.coords.accuracy);
    if (!accC) {
      accC = L.circle(ll, { radius: acc, color: '#2b7fc2', weight: 1, fillOpacity: 0.12, interactive: false }).addTo(map);
      dotC = L.circleMarker(ll, { radius: 8, color: '#fff', weight: 3, fillColor: '#2b7fc2', fillOpacity: 1, interactive: false }).addTo(map);
    } else { accC.setLatLng(ll).setRadius(acc); dotC.setLatLng(ll); }
    if (first) { first = false; map.flyTo(ll, acc > 500 ? 13 : 16, { duration: 1.2 }); }
    selectPoint(ll, 'Your location, accuracy about ±' + acc + ' m' + (acc > 200 ? ' (a phone with GPS is more precise).' : '.'));
    if (acc <= 20) { stop(); toast('Location locked (±' + acc + ' m).'); }
  }, (err) => { stop(); toast(err.code === 1 ? 'Location blocked. Allow it in your browser. A local server works better than a double-clicked file (see README).' : 'Could not get your location.'); },
  { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  wt = setTimeout(stop, 20000);
};

/* ---------- Panel, keyboard ---------- */
$('navBtn').onclick = () => { document.body.classList.toggle('min'); setTimeout(() => map.invalidateSize({ animate: false }), 280); };
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mode) return setMode(null);
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey || $('dlg').open) return;
  if (e.key === '/') { e.preventDefault(); $('sIn').focus(); }
  else if (e.key.toLowerCase() === 'a') $('addBtn').click();
  else if (e.key.toLowerCase() === 'm') $('measureBtn').click();
  else if (e.key.toLowerCase() === 'r') $('radiusBtn').click();
});

/* ---------- Start ---------- */
markers = markers.filter((m) => m && valid(m.lat, m.lng));
markers.forEach((m) => { if (!m.id) m.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); addLayer(m); });
render(); hud(map.getCenter());
})();