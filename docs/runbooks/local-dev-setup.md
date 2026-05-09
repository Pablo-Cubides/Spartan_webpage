---
version: "1.0"
status: active
owner: engineering
last_changed: "2026-05-08"
---

# Runbook: Local Development Setup

> **Audience:** New developer joining the project.
> **Goal:** From a fresh clone to a working dev environment with all gates wired up in 15 minutes.

---

## 1. Prerequisites

- Node.js 24.x (use `nvm` if you have multiple versions)
- npm 10.x (bundled with Node 24)
- Git ≥ 2.40
- Access to `.env.local` values (ask the project owner — see `docs/specs/environment-variables.md` for the full list)

---

## 2. Clone and install

```bash
git clone https://github.com/Pablo-Cubides/Spartan_webpage.git
cd Spartan_webpage
npm install                 # installs root deps + husky hooks via "prepare"
npm --prefix frontend ci    # installs frontend deps
```

> The `prepare` script runs `husky install` automatically, wiring up `.husky/pre-commit` and `.husky/pre-push`.

---

## 3. Environment variables

```bash
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with real values
```

See `docs/specs/environment-variables.md` for the complete list with criticality.

**Minimum required for `npm run dev`:**
- `DATABASE_URL`, `DIRECT_URL`
- `NEXT_PUBLIC_FIREBASE_*` (6 vars)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

---

## 4. Database

```bash
# Generate Prisma client
npm --prefix frontend run prisma:generate

# Apply migrations to your local DB
npm --prefix frontend run prisma:migrate

# Seed (optional)
npm --prefix frontend run prisma:seed
```

---

## 5. Start the dev server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 6. Verify gates work

```bash
# Quick sanity check — all SDD gates
node scripts/qa-spec-structure.js
node scripts/qa-spec-completeness.js
node scripts/qa-spec-traceability.js
node scripts/qa-spec-artifacts.js
node scripts/qa-spec-verifier.js

# Full pre-push gate (this is what husky runs on `git push`)
npm run qa:prepush
```

---

## 7. Hooks installed by husky

After `npm install`, the following git hooks are active:

| Hook | What it runs | Bypass |
|------|-------------|--------|
| `pre-commit` | `lint-staged` (prettier on staged TS/JSON/MD) | `git commit --no-verify` |
| `pre-push` | `node scripts/validate-push.js` (full SDD + security + lint) | `git push --no-verify` |

**Use `--no-verify` only when:**
- You're committing a WIP branch you'll squash later
- The hook is broken and you have a fix in flight

---

## 8. Editor recommendations

- **Prettier** as the default formatter (`.prettierrc` at repo root)
- **ESLint** plugin enabled
- **TypeScript** version: workspace (`frontend/tsconfig.json`)

---

## 9. Troubleshooting

### "husky: command not found"
The `prepare` script didn't run. Try `npm run prepare` manually.

### "validate-push.js fails on a fresh clone"
You may be missing dependencies or env vars. Run:
```bash
npm --prefix frontend ci
node -e "console.log(require('fs').readFileSync('frontend/.env.local','utf8'))" # verify .env.local exists
```

### "Prisma migration fails: connection refused"
Your `DATABASE_URL` is wrong or the DB isn't reachable. For Supabase use the **connection pooler** URL.

### "Tests pass locally but fail in CI"
Likely a missing env var. Check `.github/workflows/ci-cd.yml` and `.harness/pipelines/*.yaml` for which envs are wired in CI.

---

## 10. Definition of Done (your first PR)

- [ ] Branch named `feat/<short-name>` or `fix/<short-name>`
- [ ] `npm run qa:prepush` passes
- [ ] PR description references the relevant spec or ADR
- [ ] PR has a passing `Spartan SDD Quality Gate` check (Harness)
- [ ] PR has a passing `CI Fast Feedback` check (GitHub Actions)
- [ ] At least 1 reviewer approved
