(async function () {
  const user = Auth.require(["student", "admin"]); if (!user) return;
  await DB.init();
  UI.header(user);

  const state = { routes: [], buses: {}, sel: null, filter: "" };
  const map = L.map("map").setView([APP_CONFIG.college.lat, APP_CONFIG.college.lng], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  let busMarker = null, drawnKey = "";

  const route = () => state.routes.find(r => r.id === state.sel);
  const bus = id => state.buses[id];
  const age = b => (Date.now() - b.ts) / 1000;
  const fresh = b => b && age(b) <= APP_CONFIG.staleAfterSec;

  /* ---------- route list ---------- */
  function renderRoutes() {
    const q = state.filter.toLowerCase();
    const list = state.routes.filter(r => r.active !== false && (!q ||
      r.name.toLowerCase().includes(q) || r.stops.some(s => s.name.toLowerCase().includes(q))));
    const box = U.$("#routes");
    if (!list.length) { box.innerHTML = `<p class="muted">No route found for “${U.esc(state.filter)}”.</p>`; return; }
    box.innerHTML = list.map(r => {
      const b = bus(r.id), pill = b ? `<span class="live-pill ${fresh(b) ? "" : "stale"}">${fresh(b) ? "● LIVE" : "● OLD"}</span>` : `<span class="off-pill">not running</span>`;
      return `<div class="route ${r.id === state.sel ? "sel" : ""}" data-id="${r.id}">
        <div class="swatch" style="background:${U.esc(r.color)}"></div>
        <div><div class="t">${U.esc(r.name)}</div><div class="s">${r.stops.length} stops · next bus ${U.nextLabel(r.timings)}</div></div>${pill}</div>`;
    }).join("");
  }
  U.$("#routes").onclick = e => { const c = e.target.closest(".route"); if (c) select(c.dataset.id); };
  U.$("#search").oninput = e => { state.filter = e.target.value; renderRoutes(); };

  /* ---------- map drawing ---------- */
  function draw(fit) {
    const r = route(); layer.clearLayers();
    if (!r) return;
    const pts = r.stops.map(s => [s.lat, s.lng]);
    L.polyline(pts, { color: r.color, weight: 5, opacity: .85 }).addTo(layer);
    r.stops.forEach((s, i) => L.circleMarker([s.lat, s.lng], { radius: 8, color: "#fff", weight: 2, fillColor: r.color, fillOpacity: 1 })
      .bindTooltip(`${i + 1}. ${s.name}${s.time ? " · " + s.time : ""}`).addTo(layer));
    if (fit && pts.length) map.fitBounds(pts, { padding: [50, 50] });
  }

  function select(id) {
    state.sel = id;
    if (busMarker) { map.removeLayer(busMarker); busMarker = null; }
    drawnKey = JSON.stringify(route()); draw(true);
    renderRoutes(); tick();
  }

  /* ---------- detail + live ---------- */
  function renderDetail() {
    const r = route(), box = U.$("#detail");
    if (!r) { box.innerHTML = ""; return; }
    const b = bus(r.id), nxt = U.nextDeparture(r.timings);
    let live = `<div class="livebox off">🚏 Bus is not running right now.</div>`;
    let rows = r.stops.map(() => null);
    let curSeg = -1;

    if (b) {
      const L_ = ETA.locate(r.stops, b);
      const isFresh = fresh(b), speed = b.speed || 0;
      curSeg = L_.seg + (L_.t > .97 ? 1 : 0);
      rows = r.stops.map((_, k) => {
        const d = ETA.toStop(r.stops, b, k);
        return d.state === "ahead" ? { state: "ahead", min: ETA.minutes(d.meters, speed) } : d;
      });
      const nextIdx = rows.findIndex(x => x.state === "ahead");
      const cls = isFresh ? "ok" : "stale";
      let head = isFresh
        ? `<span class="dot"></span><b>Bus is live</b> · updated ${U.ago(b.ts)} ${b.source === "gps" ? "<span class='live-pill'>REAL GPS</span>" : "<span class='live-pill stale'>SIMULATED GPS (demo)</span>"}`
        : `<span class="dot"></span><b>Location may be outdated</b> · last update ${U.ago(b.ts)}`;
      let body = "";
      if (L_.off > 400) body = `<div class="muted">Bus is currently away from the route.</div>`;
      else if (nextIdx === -1) body = `<div class="big">Reached ${U.esc(r.stops[r.stops.length - 1].name)}</div>`;
      else body = `<div class="muted">Next stop: <b>${U.esc(r.stops[nextIdx].name)}</b></div><div class="big">${ETA.label(rows[nextIdx].min)}${isFresh ? "" : " <small class='muted'>(last known)</small>"}</div>
        <div class="muted" style="font-size:12.5px">Speed ${Math.round(speed)} km/h</div>`;
      live = `<div class="livebox ${cls}">${head}${body}</div>`;
    }

    const stops = r.stops.map((s, i) => {
      const d = rows[i]; let eta = "", cls = "";
      if (d) {
        if (d.state === "passed") { eta = "Passed"; cls = "passed"; }
        else if (d.state === "at") { eta = "At stop"; cls = "cur"; }
        else { eta = ETA.label(d.min); }
      }
      return `<li class="${cls}"><span class="n">${i + 1}</span><span class="nm">${U.esc(s.name)}</span><span class="tm">${U.esc(s.time || "")}</span><span class="eta ${d && d.state === "ahead" && d.min < 3 ? "soon" : ""}">${eta}</span></li>`;
    }).join("");

    box.innerHTML = `
      <h2 style="margin:16px 0 2px">${U.esc(r.name)}</h2>
      <div class="muted" style="font-size:13px">Daily departures</div>
      <div class="chips">${(r.timings || []).map(t => `<span class="chip ${t === nxt ? "next" : ""}">${U.esc(t)}</span>`).join("") || "<span class='muted'>No timings</span>"}</div>
      ${live}
      <h3 style="font-size:14px;margin-top:6px">Stops & ETA</h3>
      <ul class="stops">${stops}</ul>
      <button class="btn sec" id="suggest" style="width:100%;margin-top:14px">✍ Suggest a change</button>`;
    U.$("#suggest").onclick = openDialog;
    updateBusMarker(b);
  }

  function updateBusMarker(b) {
    if (!b) { if (busMarker) { map.removeLayer(busMarker); busMarker = null; } return; }
    const icon = L.divIcon({ className: "", html: `<div class="bus-icon ${fresh(b) ? "" : "stale"}">🚌</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
    if (!busMarker) busMarker = L.marker([b.lat, b.lng], { icon, zIndexOffset: 1000 }).addTo(map);
    else { busMarker.setLatLng([b.lat, b.lng]); busMarker.setIcon(icon); }
  }

  function tick() { renderDetail(); }
  setInterval(() => { tick(); renderRoutes(); }, 1000);

  /* ---------- suggest a change ---------- */
  const dlg = U.$("#dlg");
  function openDialog() {
    U.$("#qRoute").innerHTML = state.routes.map(r => `<option value="${r.id}" ${r.id === state.sel ? "selected" : ""}>${U.esc(r.name)}</option>`).join("");
    U.$("#qText").value = ""; dlg.showModal();
  }
  U.$("#qCancel").onclick = () => dlg.close();
  U.$("#qSend").onclick = async () => {
    const text = U.$("#qText").value.trim();
    if (text.length < 5) return U.toast("Please write a bit more detail", "error");
    const r = state.routes.find(x => x.id === U.$("#qRoute").value);
    await DB.addRequest({ routeId: r.id, routeName: r.name, text, by: user.name, role: user.role, status: "pending", createdAt: Date.now() });
    dlg.close(); U.toast("Sent to transport admin ✔", "ok");
  };

  /* ---------- live subscriptions ---------- */
  DB.watchBuses(b => { state.buses = b; });
  DB.watchRoutes(rs => {
    state.routes = rs;
    if (!state.sel || !route()) { const f = rs.find(r => r.active !== false); if (f) return select(f.id); }
    const key = JSON.stringify(route());
    if (key !== drawnKey) { drawnKey = key; draw(false); }
    renderRoutes(); tick();
  });
})();
