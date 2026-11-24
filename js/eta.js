/* ETA logic: bus ko route (stops ki polyline) par "snap" karo,
   phir agle stop tak ki bachi hui doori ÷ speed = ETA. */
const ETA = {
  xy(p, lat0){ return { x: p.lng * 111320 * Math.cos(lat0 * Math.PI / 180), y: p.lat * 110540 }; },

  locate(stops, bus){
    if (!stops || stops.length < 2) return null;
    const P = this.xy(bus, bus.lat);
    let best = null;
    for (let i = 0; i < stops.length - 1; i++) {
      const A = this.xy(stops[i], bus.lat), B = this.xy(stops[i+1], bus.lat);
      const dx = B.x - A.x, dy = B.y - A.y, len2 = dx*dx + dy*dy;
      const t = len2 ? Math.min(1, Math.max(0, ((P.x-A.x)*dx + (P.y-A.y)*dy) / len2)) : 0;
      const off = Math.hypot(P.x - (A.x + t*dx), P.y - (A.y + t*dy));
      if (!best || off < best.off) best = { seg: i, t, off };
    }
    best.segLen = U.haversine(stops[best.seg], stops[best.seg+1]);
    return best;
  },

  // k = stop ka index. Returns {state:'passed'|'at'|'ahead', meters}
  toStop(stops, bus, k){
    const L = this.locate(stops, bus);
    if (!L) return null;
    if (k <= L.seg) return (k === L.seg && L.t < 0.03) ? { state: "at", meters: 0, off: L.off } : { state: "passed", off: L.off };
    let m = L.segLen * (1 - L.t);
    for (let j = L.seg + 1; j < k; j++) m += U.haversine(stops[j], stops[j+1]);
    return { state: "ahead", meters: m, off: L.off };
  },

  minutes(meters, speedKmh){
    const v = (speedKmh >= 5 ? speedKmh : APP_CONFIG.defaultSpeedKmh) / 3.6;
    return meters / v / 60;
  },

  label(min){ return min < 1 ? "Arriving" : Math.round(min) + " min"; }
};
