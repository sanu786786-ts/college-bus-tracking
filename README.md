# 🚌 CampusBus — College Bus Tracking System

Agile/Scrum project (Group 7). Plain HTML + CSS + JavaScript, **Leaflet/OpenStreetMap** map, optional **Firebase** for real-time data across devices.

## Folder structure
```
bus-tracker/
├── index.html        ← Login
├── student.html      ← Routes, timings, live map, ETA, suggest change
├── driver.html       ← Driver GPS / simulated trip
├── admin.html        ← Route & timing editor, change requests, live buses
├── css/style.css
├── js/
│   ├── config.js     ← Firebase keys, college name, demo users  (EDIT THIS)
│   ├── seed.js       ← Starting routes/stops                     (EDIT THIS)
│   ├── db.js         ← Data layer (Firebase OR localStorage)
│   ├── auth.js       ← Login/roles + header
│   ├── eta.js        ← ETA calculation
│   ├── util.js
│   ├── student.js  driver.js  admin.js
└── jira/jira_import.csv  ← Epics, stories, sub-tasks, points for Jira
```

## Step 1 — Run locally (2 minutes)
1. Install **VS Code** + extension **Live Server** (or have Python).
2. Open the `bus-tracker` folder in VS Code → right-click `index.html` → *Open with Live Server*.
   (Python alternative: `cd bus-tracker && python -m http.server 8000` → open http://localhost:8000)
3. Login with `admin / admin123`, `driver / driver123`, `student / student123`.

### Demo without a real bus (Local mode)
1. Tab 1: login **driver** → choose route → **Simulate trip**.
2. Tab 2 (same browser): login **student** → select the same route → bus moves live, ETA counts down.
3. Tab 3: login **admin** → edit a timing → student tab updates instantly.

## Step 2 — Real live tracking on phones (Firebase, free)
1. https://console.firebase.google.com → *Add project* (disable Analytics).
2. *Build → Firestore Database → Create database* → **Start in test mode**.
3. *Project settings (⚙) → Your apps → Web (</>)* → register → copy the `firebaseConfig`.
4. Paste `apiKey, authDomain, projectId, appId` into `js/config.js`.
5. Header will show **☁ Firebase**. First load auto-creates the 3 sample routes.
6. For phone GPS, the site must be on **HTTPS** → deploy (Step 3).

## Step 3 — Deploy free (so phone can open it)
- **Netlify Drop:** drag the `bus-tracker` folder onto https://app.netlify.com/drop → get a public HTTPS link. 
- or **GitHub Pages / Vercel** from your GitHub repo.

## Step 4 — Put your real routes
Login as admin → *Routes & timings* → edit stops (click map to add) → Save. Update `college` coordinates + `collegeName` in `config.js`.

## Step 5 — Jira (see the Scrum plan)
1. Jira → Create project → **Scrum** (team-managed is easiest). Key: `CBT`.
2. Project settings → Board columns: **To Do → In Progress → Testing → Done**.
3. Import: *… menu → Import issues → CSV* → upload `jira/jira_import.csv`. Map: Issue id→Issue id, Parent id→Parent id, Story point estimate→Story point estimate, Sprint→Sprint.
   If import is fiddly, create issues by hand from the table below (10 minutes).
4. Backlog → create **Sprint 1/2/3**, drag stories in, **Start sprint** (set real dates). Do daily scrum, move cards. **Complete sprint** at the end — Velocity/Burndown reports only exist for sprints you really ran.
5. Connect GitHub (Project settings → Apps/Integrations). Branch names like `CBT-5-route-list`, commits like `CBT-5 add route list`.

| Sprint | Stories | Points |
|---|---|---|
| 1 | US1 routes (3), US2 timings (3), Login/navigation (2) | 8 |
| 2 | US3 live location (5), US4 ETA (5) | 10 |
| 3 | US5 admin (8) | 8 |

Which code belongs to which sprint: Sprint 1 → `index.html`, `student.html` (list/timings), `auth.js`; Sprint 2 → `driver.*`, `eta.js`, live map; Sprint 3 → `admin.*`, change requests.

## Known limitations (say these honestly in jury — it shows maturity)
- Demo logins are in `config.js` (not secure). Production: Firebase Authentication + Firestore security rules.
- ETA = remaining distance ÷ current speed (no traffic data).
- Test-mode Firestore rules expire after 30 days.
- Driver/student device clocks should be roughly in sync (staleness check uses timestamps).

## Ideas for next sprint (backlog)
Bus search improvements · "Bus is 5 minutes away" notification · Push alerts · Real Firebase Auth · Attendance.
