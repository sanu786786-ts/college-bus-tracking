# Team Contribution — Group 7

| Member | Scrum role | Jira stories | Files / module | Be ready to explain |
|---|---|---|---|---|
| **Rishav Kumar Pandey (37-B)** | Product Owner | CBT-6 Login + navigation; owns backlog and acceptance criteria | `index.html`, `js/auth.js`, `docs/TEST_CASES.md` | Why backlog is ordered by value; user stories and acceptance criteria; how login/roles work (`sessionStorage`, role check `Auth.require`); the 12 test cases |
| **Sahil Shamkant Pharate (40-B)** | Scrum Master | CBT-9 Admin route & timing management; runs Scrum events | `admin.html`, `js/admin.js`, `js/db.js`, `js/config.js`, GitHub repo, `README.md` | Sprint planning, daily scrum, velocity/burndown; how admin editor validates and saves; data layer (Firebase vs localStorage) |
| **Sania Husain Sanadi (41-B)** | Developer | CBT-4 View routes, CBT-5 View timings | `student.html`, `js/student.js`, `js/util.js`, `css/style.css`, `js/seed.js` | How routes/stops are rendered with Leaflet; search filter; next-departure logic; "Suggest a change" flow |
| **Shweta Vilas Shinde (47-B)** | Developer | CBT-7 Live location, CBT-8 ETA | `driver.html`, `js/driver.js`, `js/eta.js` | Simulated vs real GPS (`watchPosition`); sending location to DB every second/4 s; how ETA is computed (snap bus to route → distance ÷ speed); stale-location rule (30 s) |

## One-minute talking points (say in your own words)
- **Rishav:** "I wrote the user stories with acceptance criteria and prioritised the backlog. I also built login with three roles and wrote the test cases."
- **Sahil:** "I managed the sprints in Jira and built the admin panel: add/edit/delete routes with validation, and the data layer that works with Firebase or local storage."
- **Sania:** "I built the student screens: route list, search, stops and timings on the map, and the suggest-a-change form."
- **Shweta:** "I built the driver page, the live bus marker and the ETA calculation. GPS in the demo is simulated; the same page can share real GPS from a phone."

## GitHub evidence
Every member makes at least one commit from their own GitHub account on their own files, message starting with the Jira key, e.g.
`CBT-6 add login page and role check`, `CBT-9 add admin route editor validation`, `CBT-4 add route search`, `CBT-8 add ETA per stop`.
