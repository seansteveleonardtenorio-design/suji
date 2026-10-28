/* ==========================================================
   SujiTheExplorer - styles
   Sections: variables, base, top bar, layout, side panel,
   map overlays, leaflet tweaks, pin dialog, phone layout
   ========================================================== */


/* ---------- Colors and sizes ---------- */
:root {
  --forest: #123d35;
  --forest-dark: #0c2e28;
  --forest-mid: #205c4e;
  --lime: #c6ef78;
  --ink: #1b2d29;
  --muted: #5d6e68;
  --line: #e4eae6;
  --bg: #f3f6f3;
  --red: #a73636;
  --header-h: 60px;
}


/* ---------- Base ---------- */
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  margin: 0;
  font: 14px/1.45 'DM Sans', system-ui, sans-serif;
  color: var(--ink);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

h1,
h2,
p {
  margin: 0;
}

:focus-visible {
  outline: 3px solid #2f7d5f;
  outline-offset: 2px;
}

kbd {
  background: #eef2ef;
  border: 1px solid #dbe4dc;
  border-radius: 4px;
  padding: 0 5px;
  font: 11px monospace;
}


/* ---------- Top bar ---------- */
.top {
  height: var(--header-h);
  background: var(--forest-dark);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 max(16px, env(safe-area-inset-left));
  position: relative;
  z-index: 1500;
}

.brand {
  display: flex;
  align-items: center;
  padding-left: 4px;
  font: 800 16px Manrope, sans-serif;
  letter-spacing: -0.3px;
}

.logo {
  display: none;
}

.top-r {
  display: flex;
  gap: 8px;
}


/* ---------- Buttons ---------- */
.btn {
  border: 0;
  border-radius: 9px;
  padding: 10px 14px;
  font-weight: 700;
  font-size: 13px;
  background: #edf4ef;
  color: var(--forest);
  transition: background 0.15s, transform 0.1s;
}

.btn:hover {
  background: #dcebe1;
}

.btn:active {
  transform: scale(0.97);
}

.btn.pri {
  background: var(--forest);
  color: #fff;
}

.btn.pri:hover {
  background: var(--forest-mid);
}

.btn.lime {
  background: var(--lime);
  color: var(--forest-dark);
}

.btn.lime:hover {
  background: #d6f59a;
}


/* ---------- Page layout (side panel + map) ---------- */
.app {
  display: grid;
  grid-template-columns: 370px minmax(0, 1fr);
  height: calc(100dvh - var(--header-h));
  transition: grid-template-columns 0.25s;
}

/* panel hidden with the Panel button */
body.min .app {
  grid-template-columns: 0 minmax(0, 1fr);
}

body.min .side {
  visibility: hidden;
}


/* ---------- Side panel ---------- */
.side {
  background: #fff;
  border-right: 1px solid var(--line);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 22px 20px;
  scrollbar-width: thin;
}

.side h1 {
  font: 800 32px/1.1 Manrope, sans-serif;
  letter-spacing: -1.5px;
  margin-bottom: 8px;
}

.side h1 em {
  font-style: normal;
  color: #3f8062;
}

.lead {
  color: var(--muted);
  margin-bottom: 6px;
}

.how {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.how summary {
  cursor: pointer;
  font-weight: 700;
  color: var(--forest);
}

.how ol {
  margin: 8px 0 0;
  padding-left: 20px;
  display: grid;
  gap: 3px;
}

.sec {
  border-top: 1px solid var(--line);
  padding: 16px 0;
}

.lab {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: 700 13px 'DM Sans';
  color: #3d5249;
  margin-bottom: 9px;
}

.help {
  font-size: 12px;
  color: #6f7f78;
  margin-top: 7px;
}


/* ---------- Forms ---------- */
.row {
  display: flex;
  gap: 6px;
}

input,
select,
textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid #d5dfd8;
  border-radius: 9px;
  padding: 11px 12px;
  background: #fbfcfb;
  color: var(--ink);
  outline: none;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #71a68a;
  box-shadow: 0 0 0 3px #dff0e4;
}

.go {
  flex: none;
  width: 46px;
  border: 0;
  border-radius: 9px;
  background: var(--forest);
  color: #fff;
  font-size: 22px;
}

.go:hover {
  background: var(--forest-mid);
}

.rrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.rrow label {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.rrow input {
  max-width: 110px;
}


/* ---------- Search results and quick-jump chips ---------- */
.res {
  display: grid;
  gap: 6px;
  margin-top: 8px;
  max-height: 210px;
  overflow: auto;
}

.res button {
  text-align: left;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 9px 11px;
  background: #fff;
  font-size: 13px;
}

.res button:hover {
  background: #f7fbf7;
  border-color: #9bbba6;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.chip {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 20px;
  padding: 5px 11px;
  font-size: 12px;
  color: var(--forest);
  font-weight: 500;
}

.chip:hover {
  background: #eef6f0;
  border-color: #b9d2c2;
}


/* ---------- Tool buttons ---------- */
.tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.tool {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 12px;
  padding: 11px 12px;
  text-align: left;
  transition: 0.15s;
}

.tool:hover {
  background: #f3f8f4;
  border-color: #b9d2c2;
}

.tool[aria-pressed='true'] {
  background: var(--forest);
  color: #fff;
  border-color: var(--forest);
}

.tool b {
  font-size: 13px;
}

.tool small {
  font-size: 11.5px;
  opacity: 0.7;
}

.tool span {
  font-size: 19px;
}


/* ---------- Selected point card ---------- */
.card {
  background: #f7faf7;
  border: 1px solid #e7eee8;
  border-radius: 12px;
  padding: 13px;
}

.grid3 {
  display: grid;
  grid-template-columns: 1fr 1fr 70px;
  gap: 10px;
}

.grid3 small {
  display: block;
  font-size: 11px;
  color: #6f7f78;
  margin-bottom: 3px;
}

.grid3 strong {
  font: 700 14px Manrope, sans-serif;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.addr {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #e7eee8;
}

.addr small {
  display: block;
  font-size: 11px;
  color: #6f7f78;
  margin-bottom: 3px;
}

.addr strong {
  font: 700 13px/1.35 'DM Sans', sans-serif;
  overflow-wrap: anywhere;
}

.acts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 10px;
}

.lnk {
  border: 0;
  background: none;
  padding: 4px 0;
  color: #2f7050;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.lnk:hover {
  text-decoration: underline;
}

.lnk.d {
  color: var(--red);
}


/* ---------- Saved pins list ---------- */
.pill {
  min-width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: #e7f2e9;
  color: #2f6a4b;
  font-size: 12px;
  font-weight: 700;
  padding: 0 7px;
}

.list {
  display: grid;
  gap: 7px;
  max-height: 260px;
  overflow: auto;
}

.empty {
  color: #6f7f78;
  font-size: 13px;
}

.mi {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 9px;
  border: 1px solid var(--line);
  border-radius: 10px;
}

.mi:hover {
  border-color: #b9d2c2;
  background: #fafcfa;
}

.mi .m {
  flex: 1;
  min-width: 0;
  border: 0;
  background: none;
  text-align: left;
  padding: 0;
}

.mi strong,
.mi small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mi strong {
  font-size: 13px;
}

.mi small {
  font-size: 11px;
  color: var(--muted);
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex: none;
  box-shadow: 0 0 0 3px #eef4ef;
}

.x {
  border: 0;
  background: none;
  color: #7f8f87;
  font-size: 20px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 6px;
}

.x:hover {
  color: var(--red);
  background: #fbeeee;
}

.foot {
  font-size: 11.5px;
  color: #6f7f78;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}


/* ---------- Map area and things floating on it ---------- */
.mapw {
  position: relative;
  min-width: 0;
  background: #dce8df;
}

#map {
  position: absolute;
  inset: 0;
  background: #dce8df;
}

#map:empty::before {
  content: 'Loading map…';
  display: grid;
  place-items: center;
  height: 100%;
  color: var(--muted);
}

.hud {
  position: absolute;
  z-index: 800;
  left: 12px;
  top: 12px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 10px;
  padding: 7px 11px;
  font: 500 12px 'DM Sans';
  font-variant-numeric: tabular-nums;
  box-shadow: 0 4px 14px rgba(18, 61, 53, 0.15);
  pointer-events: none;
}

.toast {
  position: absolute;
  z-index: 900;
  bottom: 64px;
  left: 50%;
  transform: translate(-50%, 10px);
  opacity: 0;
  pointer-events: none;
  background: #163e34;
  color: #fff;
  padding: 11px 16px;
  border-radius: 9px;
  box-shadow: 0 8px 24px #153d3433;
  font-size: 13px;
  text-align: center;
  max-width: calc(100% - 30px);
  transition: 0.2s;
}

.toast.on {
  opacity: 1;
  transform: translate(-50%, 0);
}

.banner {
  position: absolute;
  z-index: 900;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 12px;
  padding: 9px 10px 9px 15px;
  box-shadow: 0 8px 24px #153d3430;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  max-width: calc(100% - 24px);
}

.banner[hidden] {
  display: none;
}

.banner .btn {
  padding: 7px 11px;
  font-size: 12px;
}

.pin {
  background: none;
  border: 0;
}

.pin svg {
  display: block;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
}

.me {
  animation: pulse 1.8s ease-out infinite;
}

@keyframes pulse {
  0%   { opacity: 0.9; }
  100% { opacity: 0.25; }
}


/* ---------- Leaflet overrides ---------- */
.leaflet-bar {
  border: 0 !important;
  box-shadow: 0 4px 14px rgba(18, 61, 53, 0.18) !important;
  border-radius: 10px !important;
  overflow: hidden;
}

.leaflet-bar a {
  color: var(--forest) !important;
}

.leaflet-control-layers {
  border: 0 !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 14px rgba(18, 61, 53, 0.18) !important;
  font-family: inherit;
}

.leaflet-popup-content-wrapper {
  border-radius: 12px;
}

.leaflet-popup-content {
  font: 13px/1.5 'DM Sans', sans-serif;
  margin: 12px 14px;
}


/* ---------- Save pin dialog ---------- */
dialog {
  border: 0;
  border-radius: 16px;
  padding: 24px;
  width: min(420px, calc(100% - 28px));
  box-shadow: 0 24px 80px #0a241d55;
}

dialog::backdrop {
  background: rgba(9, 28, 23, 0.5);
}

dialog h2 {
  font: 800 22px Manrope, sans-serif;
  margin-bottom: 4px;
}

dialog label {
  display: block;
  margin: 13px 0 6px;
  font-weight: 700;
  font-size: 13px;
}

.dc {
  color: var(--muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.da {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}


/* ---------- Phone layout (760px and narrower) ---------- */
@media (max-width: 760px) {
  :root {
    --header-h: 56px;
  }

  body {
    overflow: auto;
  }

  /* map on top, panel scrolls underneath */
  .app {
    display: flex;
    flex-direction: column;
    height: auto;
  }

  .mapw {
    order: 1;
    height: 60dvh;
    flex: none;
  }

  .side {
    order: 2;
    overflow: visible;
    border-right: 0;
    padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
  }

  #navBtn {
    display: none;
  }

  .brand {
    font-size: 14px;
  }

  .hud {
    display: none;
  }

  /* bigger tap targets, 16px text so iPhones don't zoom on focus */
  input,
  select,
  textarea {
    font-size: 16px;
  }

  .btn {
    padding: 9px 11px;
  }

  .tool {
    min-height: 64px;
    padding: 13px 12px;
  }

  .chip {
    padding: 8px 13px;
    font-size: 13px;
  }

  .lnk {
    padding: 10px 0;
  }

  .x {
    padding: 8px 12px;
  }

  .grid3 {
    grid-template-columns: 1fr 1fr;
  }

  .grid3 div:last-child {
    grid-column: span 2;
  }

  .leaflet-bar a {
    width: 40px !important;
    height: 40px !important;
    line-height: 40px !important;
  }

  .banner {
    flex-wrap: wrap;
    justify-content: center;
    width: calc(100% - 24px);
  }

  .toast {
    bottom: 20px;
  }

  /* pin form slides up from the bottom like a sheet */
  dialog {
    margin: auto 0 0;
    width: 100%;
    max-width: none;
    border-radius: 18px 18px 0 0;
    padding: 22px 18px calc(22px + env(safe-area-inset-bottom));
  }
}


/* ---------- Respect "reduce motion" setting ---------- */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
