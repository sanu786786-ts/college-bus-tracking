# GitHub steps (15 minutes)

## One person (repo owner) — create and push
1. github.com → **New repository** → name `college-bus-tracking` → Public/Private → Create (no README).
2. Settings → **Collaborators** → add the other 3 members.
3. In VS Code open Terminal (Ctrl + `) inside the `bus-tracker` folder:
```
git init
git add .
git commit -m "CBT-1 initial project structure and base modules"
git branch -M main
git remote add origin https://github.com/<your-username>/college-bus-tracking.git
git push -u origin main
```
(If Git is not installed: git-scm.com → install → restart VS Code.)

## Every member — commit your own work
```
git clone https://github.com/<owner>/college-bus-tracking.git
cd college-bus-tracking
git checkout -b CBT-4-student-search        # use your own Jira key + short name
# make a REAL small improvement in your own files (validation, comment, UI text, docs…)
git add .
git commit -m "CBT-4 improve route search message"
git push -u origin CBT-4-student-search
```
Then on GitHub open a **Pull Request** → another member reviews → **Merge**. This is your "code review" evidence for the Definition of Done.

## Connect with Jira (optional, 5 min)
Jira → space → Settings → Apps / Toolchain → **GitHub** → connect. Commits and PRs with `CBT-x` then appear inside the Jira story.
