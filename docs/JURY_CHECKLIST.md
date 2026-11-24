# Final Jury — checklist (sir's requirements → evidence)

| Requirement | Evidence | Where |
|---|---|---|
| Running application (not only PPT) | Live demo via Live Server | `index.html` |
| Main end-to-end workflow with realistic sample data | Driver → Student → Admin demo with real campus routes | Routes saved in Admin panel |
| Core features | Routes, timings, live location, ETA, admin management | student / driver / admin pages |
| Input validation, errors, exceptional cases | Wrong password, <2 stops, bad timing, short suggestion, no bus running, stale location | TC2, TC5, TC6, TC9, TC11, TC8 |
| ≥ 5 test cases (positive, negative, boundary) | 12 test cases | `docs/TEST_CASES.md` |
| Jira board, stories, acceptance criteria, sprint plan, DoD | Board, Backlog, 3 sprints, Burndown, Velocity | Jira + `docs/DEFINITION_OF_DONE.md` |
| GitHub repo + meaningful commits | Repo with commits by all 4 members | `docs/GITHUB_STEPS.md` |
| Individual contribution | Talking points per member | `docs/TEAM_CONTRIBUTION.md` |
| Simulation labelled | "SIMULATED GPS (demo)" shown on driver, student and admin pages | Driver → Simulate trip |

## Demo order (8–10 min)
1. Jira: backlog → sprints → board → burndown/velocity → Definition of Done (1.5 min)
2. App: login → student route list/search → driver Simulate trip → student live map + ETA (SIMULATED label) (3 min)
3. Admin: edit timing → student updates; approve a change request (1.5 min)
4. Run 3 test cases live: TC2, TC5, TC8 (1.5 min)
5. GitHub repo + commits; each member explains their part (2 min)
