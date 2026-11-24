(async function () {
  const user = Auth.require(["driver", "admin"]); if (!user) return;
  await DB.init(); UI.header(user);

  let routes = [], mode = null, timer = null, watchId = null, lastSend = 0, activeRouteId = null;
  const map = L.map("map").setView([APP_CONFIG.college.lat, APP_CONFIG.college.lng], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(map);
  const layer = L.layerGroup().addTo(map); let me = null;
  const sel = U.$("#route"), cur = () => routes.find(r => r.id === sel.value);

  DB.watchRoutes(rs => {
    routes = rs.filter(r => r.active !== false);
    const keep = sel.value;
    sel.innerHTML = routes.map(r => `<option value="${r.id}">${U.esc(r.name)}</option>`).join("");
    if (keep) sel.value = keep;
    if (!mode) drawRoute();
  });
  sel.onchange = () => { if (!mode) drawRoute(); };
  function drawRoute() {
    const r = cur(); layer.clearLayers(); if (!r) return;
    const pts = r.stops.map(s => [s.lat, s.lng]);
    L.polyline(pts, { color: r.color, weight: 5 }).addTo(layer);
    r.stops.forEach(s => L.circleMarker([s.lat, s.lng], { radius: 7, color: "#fff", weight: 2, fillColor: r.color, fillOpacity: 1 }).bindTooltip(s.name).addTo(layer));
    map.fitBounds(pts, { padding: [40, 40] });
  }

  const ui = on => { U.$("#stop").disabled = !on; U.$("#gps").disabled = on; U.$("#sim").disabled = on; sel.disabled = on; };
  function send(lat, lng, speed) {
    const loc = { lat, lng, speed: Math.round(speed || 0), ts: Date.now(), source: mode === "gps" ? "gps" : "simulated" };
    DB.setBus(activeRouteId, loc).catch(e => U.toast("Send failed: " + e.message, "error"));
    U.$("#last").textContent = new Date().toLocaleTimeString();
    U.$("#pos").textContent = `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)} · ${loc.speed} km/h`;
    if (!me) me = L.marker([lat, lng]).addTo(map); else me.setLatLng([lat, lng]);
  }

  /* ---- real GPS ---- */
  U.$("#gps").onclick = () => {
    if (!navigator.geolocation) return U.toast("GPS not supported on this device", "error");
    activeRouteId = sel.value; mode = "gps"; ui(true); U.$("#st").textContent = "Sharing GPS…";
    watchId = navigator.geolocation.watchPosition(p => {
      if (Date.now() - lastSend < 4000) return;      // har ~4 sec me ek update
      lastSend = Date.now();
      send(p.coords.latitude, p.coords.longitude, (p.coords.speed || 0) * 3.6);
    }, err => { U.toast("GPS error: " + err.message, "error"); stop(); },
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
  };

  /* ---- simulation: stops ki line par bus chalao ---- */
  U.$("#spd").oninput = e => U.$("#spdv").textContent = e.target.value;
  U.$("#sim").onclick = () => {
    const r = cur(); if (!r || r.stops.length < 2) return U.toast("Route needs 2+ stops", "error");
    activeRouteId = r.id; mode = "sim"; ui(true); U.$("#st").textContent = "Simulating (SIMULATED GPS)…";
    const segs = []; let total = 0;
    for (let i = 0; i < r.stops.length - 1; i++) { const d = U.haversine(r.stops[i], r.stops[i + 1]); segs.push(d); total += d; }
    let s = 0;
    timer = setInterval(() => {
      const kmh = +U.$("#spd").value; s += kmh / 3.6;                // 1 sec me itne meter
      if (s >= total) { s = total; }
      let acc = 0, i = 0; while (i < segs.length - 1 && acc + segs[i] < s) { acc += segs[i]; i++; }
      const t = Math.min(1, (s - acc) / segs[i]), A = r.stops[i], B = r.stops[i + 1];
      send(A.lat + (B.lat - A.lat) * t, A.lng + (B.lng - A.lng) * t, s >= total ? 0 : kmh);
      if (s >= total) { U.$("#st").textContent = "Trip complete ✔"; clearInterval(timer); timer = null; U.$("#sim").disabled = false; U.$("#sim").textContent = "↻ Restart trip"; }
    }, 1000);
  };

  function stop() {
    if (timer) clearInterval(timer); if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    timer = watchId = null; mode = null; ui(false);
    if (activeRouteId) DB.clearBus(activeRouteId);
    U.$("#st").textContent = "Idle"; U.$("#sim").textContent = "▶ Simulate trip";
    if (me) { map.removeLayer(me); me = null; }
  }
  U.$("#stop").onclick = stop;
  window.addEventListener("beforeunload", () => { if (mode === "gps") navigator.geolocation.clearWatch(watchId); });
})();
