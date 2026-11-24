const Auth = {
  login(username, password){
    const f = APP_CONFIG.users.find(x => x.username === username.trim() && x.password === password);
    if (!f) return null;
    sessionStorage.setItem("cbt_user", JSON.stringify({ username: f.username, role: f.role, name: f.name }));
    return f;
  },
  user(){ try { return JSON.parse(sessionStorage.getItem("cbt_user")); } catch { return null; } },
  logout(){ sessionStorage.removeItem("cbt_user"); location.href = "index.html"; },
  home(role){ return { student: "student.html", driver: "driver.html", admin: "admin.html" }[role]; },
  require(roles){
    const u = this.user();
    if (!u || !roles.includes(u.role)) { location.href = "index.html"; return null; }
    return u;
  }
};

const UI = {
  header(user){
    const links = [];
    if (user.role === "admin") {
      links.push(["admin.html","Admin"], ["student.html","Student view"], ["driver.html","Driver"]);
    }
    const here = location.pathname.split("/").pop();
    const nav = links.map(([h,l]) => `<a href="${h}" class="${h===here?'on':''}">${l}</a>`).join("");
    const el = document.getElementById("topbar");
    el.innerHTML = `
      <div class="brand">🚌 <span>${U.esc(APP_CONFIG.appName)}</span><small>${U.esc(APP_CONFIG.collegeName)}</small></div>
      <nav>${nav}</nav>
      <div class="who">
        <span class="mode ${DB.mode}" title="Data mode">${DB.mode === 'firebase' ? '☁ Firebase' : '💾 Local mode'}</span>
        <span class="badge ${user.role}">${U.esc(user.role)}</span>
        <button class="btn ghost sm" id="logoutBtn">Logout</button>
      </div>`;
    document.getElementById("logoutBtn").onclick = () => Auth.logout();
  }
};
