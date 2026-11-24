const U = {
  esc(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
  $(sel, root=document){ return root.querySelector(sel); },
  $$(sel, root=document){ return [...root.querySelectorAll(sel)]; },
  haversine(a, b){
    const R = 6371000, rad = x => x * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  },
  ago(ts){
    const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return s + " sec ago";
    if (s < 3600) return Math.round(s/60) + " min ago";
    return Math.round(s/3600) + " hr ago";
  },
  // "07:30" -> minutes since midnight
  toMin(t){ const m = /^(\d{1,2}):(\d{2})$/.exec(t || ""); return m ? (+m[1])*60 + (+m[2]) : null; },
  nextDeparture(timings){
    const now = new Date(), cur = now.getHours()*60 + now.getMinutes();
    const mins = (timings || []).map(t => [t, U.toMin(t)]).filter(x => x[1] !== null).sort((a,b) => a[1]-b[1]);
    return (mins.find(x => x[1] >= cur) || [null])[0];
  },
  nextLabel(timings){
    const n = U.nextDeparture(timings); if (n) return n;
    const all = (timings || []).filter(t => U.toMin(t) !== null).sort((a,b) => U.toMin(a)-U.toMin(b));
    return all.length ? all[0] + " tomorrow" : "—";
  },
  toast(msg, kind="info"){
    let box = U.$("#toasts");
    if (!box){ box = document.createElement("div"); box.id = "toasts"; document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = "toast " + kind; t.textContent = msg; box.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }
};
