# Test Cases — College Bus Tracking System (CampusBus)

Run these in front of the jury (Live Server running). Tick the **Result** column and take a screenshot for evidence.
Types: **P** = Positive, **N** = Negative, **B** = Boundary.

| ID | Type | Feature / User story | Steps | Expected result | Result |
|---|---|---|---|---|---|
| TC1 | P | Login (CBT-6) | Open `index.html`, login `student / student123` | Student page opens, header shows role STUDENT | ☐ |
| TC2 | N | Login (CBT-6) | Login with `student / wrong` | Message "Wrong username or password"; stays on login page | ☐ |
| TC3 | P | View routes (US1, CBT-4) | Student page → click a route | Route is drawn on map; list of stops with scheduled times is shown | ☐ |
| TC4 | P/N | Search (feedback item) | Type `katraj` in search → then type `zzzz` | First: matching route shown. Second: "No route found for “zzzz”" | ☐ |
| TC5 | B | Admin route validation (US5, CBT-9) | Admin → New route → enter name only (0 stops) → Save | Error "A route needs at least 2 stops"; nothing saved (2 stops = minimum accepted) | ☐ |
| TC6 | N/P | Timings validation (US2, CBT-5) | Admin → edit route → timings `7:3x` → Save; then `07:30, 09:00` → Save | First: error "Timings must be in HH:MM format". Second: "Route saved" | ☐ |
| TC7 | P | Live location + ETA (US3, US4 — CBT-7, CBT-8) | Driver → Simulate trip. Student → same route | "Bus is live", bus marker moves, ETA per stop counts down, label **SIMULATED GPS (demo)** | ☐ |
| TC8 | B | Stale location (risk control) | Stop driver; wait > 30 s | Student sees "Location may be outdated · last update N sec ago" and "(last known)" ETA. At ≤ 30 s the bus is still "live" | ☐ |
| TC9 | N/P | Suggest a change | Student → Suggest a change → type `abc` → Send; then a proper sentence → Send | First: "Please write a bit more detail". Second: "Sent to transport admin"; request visible in Admin → Change requests as PENDING | ☐ |
| TC10 | N | Access control | While logged in as student (or logged out) open `admin.html` | Redirected to login page | ☐ |
| TC11 | B | No bus running | Student → pick a route whose driver is not sharing | "Bus is not running right now" | ☐ |
| TC12 | P | Admin change reflected (US5) | Admin edits timings → Save; look at student page | Student page shows new timings without refresh | ☐ |

## Notes for the viva
- **Simulated vs real:** "Simulate trip" is a **simulated GPS feed** (virtual bus moving along the route). "Share real GPS" uses the phone's location sensor. The app labels both (SIMULATED GPS / REAL GPS).
- **ETA** is calculated (remaining distance ÷ current speed). It is **not** from a third-party traffic API.
- Login is a demo role-login (accounts in `js/config.js`), not production security.
