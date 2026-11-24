/* Data layer — ek hi API, peeche do implementations:
   - Firebase Firestore (agar config bhara hai) -> alag devices par real-time
   - localStorage (default)                    -> same browser ke tabs me real-time */
(function () {
  const cfg = window.FIREBASE_CONFIG || {};
  const useFB = !!(cfg.apiKey && window.firebase);
  const DB = { mode: useFB ? "firebase" : "local" };
  const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99);
  const onErr = e => { console.error(e); window.U && U.toast("Database error: " + (e.message || e), "error"); };

  if (useFB) {
    firebase.initializeApp(cfg);
    const fs = firebase.firestore();
    DB.init = async () => {
      const snap = await fs.collection("routes").limit(1).get();
      if (snap.empty) {
        const batch = fs.batch();
        SEED_ROUTES.forEach(r => batch.set(fs.collection("routes").doc(r.id), r));
        await batch.commit();
      }
    };
    DB.watchRoutes = cb => fs.collection("routes").onSnapshot(
      s => cb(s.docs.map(d => ({ ...d.data(), id: d.id })).sort(byOrder)), onErr);
    DB.saveRoute = r => fs.collection("routes").doc(r.id).set(r);
    DB.deleteRoute = id => fs.collection("routes").doc(id).delete();
    DB.watchBuses = cb => fs.collection("buses").onSnapshot(s => {
      const o = {}; s.docs.forEach(d => o[d.id] = d.data()); cb(o);
    }, onErr);
    DB.setBus = (routeId, loc) => fs.collection("buses").doc(routeId).set(loc);
    DB.clearBus = routeId => fs.collection("buses").doc(routeId).delete();
    DB.watchRequests = cb => fs.collection("requests").orderBy("createdAt", "desc").onSnapshot(
      s => cb(s.docs.map(d => ({ ...d.data(), id: d.id }))), onErr);
    DB.addRequest = r => fs.collection("requests").add(r);
    DB.updateRequest = (id, patch) => fs.collection("requests").doc(id).update(patch);
  } else {
    const K = k => "cbt_" + k;
    const defaults = { routes: [], buses: {}, requests: [] };
    const read = k => { try { const v = JSON.parse(localStorage.getItem(K(k))); return v ?? defaults[k]; } catch { return defaults[k]; } };
    const subs = { routes: [], buses: [], requests: [] };
    const fire = k => subs[k].forEach(f => f(prep(k, read(k))));
    const write = (k, v) => { localStorage.setItem(K(k), JSON.stringify(v)); fire(k); };
    const prep = (k, v) => k === "routes" ? [...v].sort(byOrder) : k === "requests" ? [...v].sort((a,b) => b.createdAt - a.createdAt) : v;
    const sub = (k, cb) => { subs[k].push(cb); cb(prep(k, read(k))); return () => { subs[k] = subs[k].filter(f => f !== cb); }; };
    window.addEventListener("storage", e => { if (e.key && e.key.startsWith("cbt_")) fire(e.key.slice(4)); });

    DB.init = async () => { if (localStorage.getItem(K("routes")) === null) write("routes", SEED_ROUTES); };
    DB.watchRoutes = cb => sub("routes", cb);
    DB.saveRoute = async r => { const a = read("routes").filter(x => x.id !== r.id); a.push(r); write("routes", a); };
    DB.deleteRoute = async id => { write("routes", read("routes").filter(x => x.id !== id)); const b = read("buses"); delete b[id]; write("buses", b); };
    DB.watchBuses = cb => sub("buses", cb);
    DB.setBus = async (id, loc) => { const b = read("buses"); b[id] = loc; write("buses", b); };
    DB.clearBus = async id => { const b = read("buses"); delete b[id]; write("buses", b); };
    DB.watchRequests = cb => sub("requests", cb);
    DB.addRequest = async r => { const a = read("requests"); a.push({ ...r, id: "q" + Date.now().toString(36) }); write("requests", a); };
    DB.updateRequest = async (id, patch) => write("requests", read("requests").map(x => x.id === id ? { ...x, ...patch } : x));
    DB.resetLocal = () => { ["routes","buses","requests"].forEach(k => localStorage.removeItem(K(k))); location.reload(); };
  }
  window.DB = DB;
})();
