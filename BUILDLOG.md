# BUILDLOG.md — AI Usage Log

This capstone was built with AI assistance (Claude). This log records where it helped, where it was wrong, and what I changed — honestly, per the assignment's requirement.

## Where AI helped

- **Scaffolding the layered architecture** (routes → controllers → services → repositories) — AI proposed the folder structure and the pattern of keeping tenant_id checks inside repository queries for isolation.
- **CORS and rate-limiting setup** — AI suggested `express-rate-limit` config and the `cors` middleware, which I hadn't used together before.
- **Geo fallback chain logic** — AI wrote the try/catch fallback pattern (Provider A → Provider B → degrade without geo data).
- **Test cases** — AI wrote the initial Jest/Supertest test file covering the "scary cases" from the assignment brief (invalid payload, oversized payload, honeypot, CORS preflight).
- **Debugging syntax errors** — AI helped diagnose several copy-paste mistakes where code ended up nested inside the wrong function (e.g. a function accidentally pasted inside another function's body in `widget.repository.js`), and a case where `module.exports` referenced a function that hadn't actually been defined yet.

## Where AI was wrong / had to be corrected

- The first `docker-compose.yml` had `ports` nested incorrectly under `environment` due to an indentation mistake during a manual edit — this caused a YAML validation error and had to be rewritten.
- Files were repeatedly created inside `src/routes/` instead of the project root when VS Code's "New File" action was used with the wrong folder selected — root-level files (`docker-compose.yml`, `capstone.yaml`, `EVIDENCE.md`, `BUILDLOG.md`) had to be moved with `Move-Item` after being created in the wrong place. This was a tooling/workflow mistake, not an AI code mistake, but it repeatedly cost time.
- Early in development, the server was frequently tested without being restarted after code changes, leading to confusing "Cannot POST" errors that looked like routing bugs but were actually stale running processes. This was resolved by explicitly restarting `node src/index.js` after every code change and consolidating to fewer terminal windows.

## What I changed / verified myself

- Verified all tenant-isolation queries manually (via curl/Invoke-RestMethod tests) to confirm one tenant cannot access another's widgets or submissions.
- Manually tested the rate limiter by firing 6+ rapid requests and confirming the 6th returned 429.
- Manually tested the geo fallback chain using a `FORCE_FAIL_GEO_A` environment flag to force Provider A to fail and confirm Provider B (and then graceful degradation) worked as expected.
- Manually tested the email side-effect failure path using a `FORCE_FAIL_EMAIL` flag to confirm a failing email never blocks a successful submission response.
- Ran the full widget → embed → cross-origin render → submit → dashboard flow end-to-end in a browser to confirm the system works beyond just API-level tests.