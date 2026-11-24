(async function () {
  const user = Auth.require(["admin"]); if (!user) return;
  await DB.init(); UI.header(user);

  let routes = [], requests = [], buses = {}, draft = null, map = null, layer = null;

  /* ---------- tabs ---------- */
  U.$$(".tab").forEach(b => b.onclick = () => {
    U.$$(".tab").forEach(x => x.classList.toggle("on", x === b));
    ["routes", "requests", "buses"].forEach(t => U.$("#t-" + t).classList.toggle("hidden", t !== b.dataset.t));
    if (b.dataset.t === "routes" && map) setTimeout(() => map.invalidateSize(), 50);
  });

  /* ---------- route list ---------- */
  function renderList() {
    U.$("#rlist").innerHTML = routes.map(r => `
      <div class="route ${draft && draft.id === r.id ? "sel" : ""}" data-id="${r.id}">
        <div class="swatch" style="background:${U.esc(r.color)}"></div>
        <div><div class="t">${U.esc(r.name)}</div><div class="s">${r.stops.length} stops · ${(r.timings || []).length} trips ${r.active === false ? "· <b>hidden</b>" : ""}</div></div>
      </div>`).join("") || `<p class="muted">No routes yet.</p>`;
  }
  U.$("#rlist").onclick = e => { const c = e.target.closest(".route"); if (c) edit(routes.find(r => r.id === c.dataset.id)); };
  U.$("#newRoute").onclick = () => edit({ id: "r_" + Date.now().toString(36), order: routes.length + 1, name: "", color: "#f59e0b", active: true, timings: [], stops: [], isNew: true });

  /* ---------- editor ---------- */
  function edit(r) {
    draft = JSON.parse(JSON.stringify(r)); renderList();
    U.$("#editor").innerHTML = `
      <div class="row"><h2 class="grow">${draft.isNew ? "New route" : "Edit route"}</h2>
        <label style="margin:0"><input type="checkbox" id="eActive" style="width:auto" ${draft.active !== false ? "checked" : ""}> Visible to students</label></div>
      <div class="row" style="margin-top:12px">
        <div class="field grow"><label>Route name</label><input id="eName" value="${U.esc(draft.name)}" placeholder="Route 4 — Station → College"></div>
        <div class="field" style="width:80px"><label>Colour</label><input type="color" id="eColor" value="${U.esc(draft.color)}" style="padding:2px;height:40px"></div>
      </div>
      <div class="field"><label>Departure timings (comma separated, 24h)</label><input id="eTimings" value="${U.esc((draft.timings || []).join(", "))}" placeholder="07:30, 08:30, 16:30"></div>
      <label>Stops — click on the map to add a stop</label>
      <div class="row" style="margin-bottom:8px">
        <input id="placeQ" class="grow" placeholder="Place name OR coordinates, e.g. Loni Kalbhor  or  18.4737, 73.9894">
        <button class="btn sec" id="placeGo" type="button">Go</button>
      </div>
      <div id="emap" style="height:340px;border-radius:12px;margin-bottom:10px"></div>
      <table><thead><tr><th>#</th><th>Stop name</th><th>Lat</th><th>Lng</th><th>Time</th><th></th></tr></thead><tbody id="stopRows"></tbody></table>
      <div class="row" style="margin-top:16px">
        <button class="btn" id="save">💾 Save route</button>
        ${draft.isNew ? "" : `<button class="btn danger" id="del">Delete</button>`}
      </div>`;
    U.$("#eActive").onchange = e => draft.active = e.target.checked;
    U.$("#eName").oninput = e => draft.name = e.target.value;
    U.$("#eColor").oninput = e => { draft.color = e.target.value; drawDraft(false); };
    U.$("#eTimings").oninput = e => draft.timings = e.target.value.split(",").map(x => x.trim()).filter(Boolean);
    U.$("#save").onclick = save;
    if (U.$("#del")) U.$("#del").onclick = remove;
    const goPlace = async () => {
      const q = U.$("#placeQ").value.trim(); if (!q) return;
      const m = /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(q);   // "18.4737, 73.9894"
      if (m) { map.setView([+m[1], +m[2]], 17); return; }
      try {
        const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(q));
        const j = await r.json();
        if (!j.length) return U.toast("Place not found. Try a shorter name or zoom the map manually.", "error");
        map.setView([+j[0].lat, +j[0].lon], 17);
      } catch (e) { U.toast("Search failed (check internet). Zoom the map manually.", "error"); }
    };
    U.$("#placeGo").onclick = goPlace;
    U.$("#placeQ").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); goPlace(); } };

    if (map) { map.remove(); }
    map = L.map("emap").setView([APP_CONFIG.college.lat, APP_CONFIG.college.lng], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(map);
    layer = L.layerGroup().addTo(map);
    map.on("click", e => { draft.stops.push({ name: "Stop " + (draft.stops.length + 1), lat: +e.latlng.lat.toFixed(5), lng: +e.latlng.lng.toFixed(5), time: "" }); renderStops(); drawDraft(false); });
    renderStops(); drawDraft(true);
  }

  function renderStops() {
    U.$("#stopRows").innerHTML = draft.stops.map((s, i) => `<tr>
      <td>${i + 1}</td>
      <td><input data-i="${i}" data-k="name" value="${U.esc(s.name)}"></td>
      <td><input data-i="${i}" data-k="lat" value="${s.lat}" style="width:92px"></td>
      <td><input data-i="${i}" data-k="lng" value="${s.lng}" style="width:92px"></td>
      <td><input data-i="${i}" data-k="time" value="${U.esc(s.time || "")}" placeholder="07:40" style="width:76px"></td>
      <td style="white-space:nowrap"><button class="btn sec sm" data-up="${i}">↑</button> <button class="btn sec sm" data-dn="${i}">↓</button> <button class="btn danger sm" data-rm="${i}">✕</button></td></tr>`).join("")
      || `<tr><td colspan="6" class="muted">Click on the map to add the first stop.</td></tr>`;
  }
  U.$("#editor").addEventListener("input", e => {
    const i = e.target.dataset.i; if (i === undefined) return;
    const k = e.target.dataset.k, v = e.target.value;
    draft.stops[i][k] = (k === "lat" || k === "lng") ? parseFloat(v) : v;
    drawDraft(false);
  });
  U.$("#editor").addEventListener("click", e => {
    const t = e.target, S = draft && draft.stops;
    if (t.dataset.rm !== undefined) S.splice(+t.dataset.rm, 1);
    else if (t.dataset.up !== undefined && +t.dataset.up > 0) { const i = +t.dataset.up; [S[i - 1], S[i]] = [S[i], S[i - 1]]; }
    else if (t.dataset.dn !== undefined && +t.dataset.dn < S.length - 1) { const i = +t.dataset.dn; [S[i + 1], S[i]] = [S[i], S[i + 1]]; }
    else return;
    renderStops(); drawDraft(false);
  });

  function drawDraft(fit) {
    if (!layer) return; layer.clearLayers();
    const pts = draft.stops.filter(s => isFinite(s.lat) && isFinite(s.lng)).map(s => [s.lat, s.lng]);
    if (pts.length > 1) L.polyline(pts, { color: draft.color, weight: 5 }).addTo(layer);
    draft.stops.forEach((s, i) => isFinite(s.lat) && isFinite(s.lng) && L.circleMarker([s.lat, s.lng], { radius: 8, color: "#fff", weight: 2, fillColor: draft.color, fillOpacity: 1 }).bindTooltip(`${i + 1}. ${s.name}`).addTo(layer));
    if (fit && pts.length) map.fitBounds(pts, { padding: [30, 30] });
  }

  async function save() {
    const d = draft, bad = [];
    if (!d.name.trim()) bad.push("Route name is required");
    if (d.stops.length < 2) bad.push("A route needs at least 2 stops");
    if (d.stops.some(s => !s.name.trim() || !isFinite(s.lat) || !isFinite(s.lng))) bad.push("Every stop needs a name and valid latitude/longitude");
    if ((d.timings || []).some(t => U.toMin(t) === null)) bad.push("Timings must be in HH:MM format, e.g. 07:30");
    if (bad.length) return U.toast(bad[0], "error");
    const clean = { ...d }; delete clean.isNew;
    await DB.saveRoute(clean); U.toast("Route saved — students see the change instantly ✔", "ok");
    draft.isNew = false; edit(clean);
  }
  async function remove() {
    if (!confirm("Delete this route permanently?")) return;
    await DB.deleteRoute(draft.id); draft = null;
    U.$("#editor").innerHTML = `<p class="muted">Route deleted.</p>`; U.toast("Deleted", "ok");
  }

  /* ---------- requests ---------- */
  function renderReqs() {
    const pend = requests.filter(r => r.status === "pending").length;
    U.$("#pc").textContent = pend ? `(${pend})` : "";
    U.$("#reqs").innerHTML = requests.map(q => `
      <div class="route" style="cursor:default;align-items:flex-start">
        <div class="grow"><div class="t">${U.esc(q.routeName)} <span class="tag ${q.status}">${q.status}</span></div>
          <div style="margin:4px 0">${U.esc(q.text)}</div>
          <div class="s">by ${U.esc(q.by)} (${U.esc(q.role)}) · ${new Date(q.createdAt).toLocaleString()}</div></div>
        ${q.status === "pending" ? `<div class="row"><button class="btn ok sm" data-ap="${q.id}">Approve</button><button class="btn danger sm" data-rj="${q.id}">Reject</button></div>` : ""}
      </div>`).join("") || `<p class="muted">No change requests yet. Students send them with “Suggest a change”.</p>`;
  }
  U.$("#reqs").onclick = async e => {
    const a = e.target.dataset.ap, r = e.target.dataset.rj;
    if (a) { await DB.updateRequest(a, { status: "approved", reviewedBy: user.name }); U.toast("Approved — now apply the change in the Routes tab", "ok"); }
    if (r) { await DB.updateRequest(r, { status: "rejected", reviewedBy: user.name }); }
  };

  /* ---------- live buses ---------- */
  function renderLive() {
    const rows = routes.map(r => {
      const b = buses[r.id]; if (!b) return `<tr><td>${U.esc(r.name)}</td><td class="muted" colspan="3">Not running</td></tr>`;
      const fresh = (Date.now() - b.ts) / 1000 <= APP_CONFIG.staleAfterSec;
      return `<tr><td>${U.esc(r.name)}</td><td><span class="live-pill ${fresh ? "" : "stale"}">${fresh ? "● LIVE" : "● STALE"}</span></td><td>${b.lat.toFixed(4)}, ${b.lng.toFixed(4)}</td><td>${U.ago(b.ts)} · ${b.speed || 0} km/h · ${b.source === 'gps' ? 'Real GPS' : 'SIMULATED'}</td></tr>`;
    }).join("");
    U.$("#live").innerHTML = `<table><thead><tr><th>Route</th><th>Status</th><th>Position</th><th>Updated / source</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  DB.watchRoutes(rs => { routes = rs; renderList(); renderLive(); });
  DB.watchRequests(rs => { requests = rs; renderReqs(); });
  DB.watchBuses(b => { buses = b; renderLive(); });
  setInterval(renderLive, 2000);
})();
