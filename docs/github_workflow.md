# GitHub Collaboration Workflow

## Branch Structure

```
main          ← Production-ready, protected branch
  └─ develop  ← Integration branch (all features merge here first)
       ├─ feature/auth
       ├─ feature/jobs
       ├─ feature/bids
       ├─ feature/projects
       ├─ feature/payments
       └─ feature/reviews
```

## Daily Workflow

```bash
# 1. Get latest changes
git checkout develop
git pull origin develop

# 2. Create your feature branch
git checkout -b feature/your-module

# 3. Do your work, commit often
git add .
git commit -m "feat(auth): add JWT login endpoint"

# 4. Push to GitHub
git push origin feature/your-module

# 5. Open a Pull Request → develop on GitHub
# 6. Request review from your team
# 7. After approval, merge and delete the feature branch
```

## Commit Message Format

Use this format for all commits:
```
type(module): short description

Examples:
feat(auth):     add password reset
fix(bids):      prevent duplicate bids
docs(jobs):     add API examples to routes
test(auth):     add login test case
refactor(db):   switch to async sessions
```

## Pull Request Checklist

Before opening a PR, ensure:
- [ ] Code runs without errors locally
- [ ] Tests pass: `pytest tests/ -v`
- [ ] No TODO/debug print statements left
- [ ] Code is commented and readable
- [ ] PR title follows commit message format

## Team Module Ownership

| Developer | Module | Branch |
|-----------|--------|--------|
| Dev 1 | Authentication | `feature/auth` |
| Dev 2 | Job Postings | `feature/jobs` |
| Dev 3 | Bidding System | `feature/bids` |
| Dev 4 | Project Workflow | `feature/projects` |
| Dev 5 | Payment Simulation | `feature/payments` |
| Dev 6 | Reviews + Testing + Deployment | `feature/reviews` |

## Release to Production

```bash
# Merge develop → main (only when all features are stable)
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```
