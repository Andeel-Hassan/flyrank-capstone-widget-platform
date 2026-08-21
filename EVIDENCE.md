# EVIDENCE.md — Proof of Definition of Done

## Widget Management

**Authenticated CRUD; unauthenticated requests rejected**
```
POST /api/widgets without token → 401 {"error":"Missing or invalid Authorization header"}
POST /api/widgets with valid token → 201, widget created (see id 1, "Newsletter Signup")
```

**Multi-tenant isolation**
```
All widget/submission repository queries filter by tenant_id, e.g.:
SELECT * FROM widgets WHERE id = $1 AND tenant_id = $2
A tenant cannot fetch, edit, or delete another tenant's widget — the query returns no row.
```

## Widget Delivery

**Embed snippet generated per widget**
```
Every widget response includes:
"embed_snippet": "<script src=\"http://localhost:3000/widget.js?id=1\"></script>"
```

**Public config endpoint, cached**
```
GET /widgets/1/config → 200, Cache-Control: public, max-age=60
Response: {"id":1,"type":"signup-form","title":"Newsletter Signup",...}
```

**Widget.js served as versioned/cacheable bundle**
```
GET /widget.js → served via express.static with maxAge: '1y'
```

**Widget renders on a different-origin page**
```
test-site/index.html served on http://localhost:5500
API served on http://localhost:3000
Widget rendered successfully cross-origin (screenshot: "Newsletter Signup" form appears on the test-site page).
```

## Public Submission API

**CORS + preflight handled**
```
Test: "CORS preflight (OPTIONS) is handled" — PASS
OPTIONS /api/submissions with Origin header → status < 300, Access-Control-Allow-Origin header present
```

**Invalid / oversized payload → clean 4xx**
```
Test: "rejects invalid payload with 400" — PASS
Test: "rejects oversized field value with 413" — PASS
```

**Valid submissions stored, linked to widget + tenant**
```
POST /api/submissions {"widgetId":1,"data":{"email":"validtest@example.com"}}
→ 201 {"success":true,"id":<n>}
Confirmed via GET /api/dashboard/submissions — submission appears linked to widget_id 1, tenant's own data.
```

## Abuse Protection

**Rate limiting returns 429 under burst, legitimate traffic still served**
```
6 rapid POSTs to /api/submissions from same IP:
Request 1-5: 201 {"success":true,"id":17-21}
Request 6: 429 {"error":"Too many submissions. Please try again later."}
```

**Honeypot blocks spam**
```
Test: "silently rejects submission when honeypot is filled" — PASS
POST with website:"http://spam.com" (honeypot filled) → 400, not stored
```

## Enrichment & Safe Side Effects

**Geo fallback chain: Provider A → B → degrade**
```
Normal case (Provider A works):
POST with X-Forwarded-For: 8.8.8.8 → submission stored with geo_country="United States", geo_city="Ashburn"

Forced failure case (FORCE_FAIL_GEO_A=true):
Server log: "Geo provider A failed, trying provider B: Provider A forcibly disabled for testing"
Server log: "Geo provider B also failed, continuing without geo data: Request failed with status code 429"
Submission still succeeded (id 23), with geo_country/geo_city left null — degrade, never fail.
```

**Email side effect failure does not block submission**
```
Normal: console log "📧 [EMAIL] Confirmation sent to emailtest@example.com for widget "Newsletter Signup""
Forced failure (FORCE_FAIL_EMAIL=true):
Server log: "Confirmation email failed (non-critical): Email service is down (forced failure for testing)"
Response was still 201 {"success":true,"id":<n>} — submission was stored regardless.
```

## Tests & Documentation

**Automated tests cover the required scary cases**
```
npm test →
PASS tests/submission.test.js
  ✓ rejects invalid payload with 400
  ✓ rejects oversized field value with 413
  ✓ silently rejects submission when honeypot is filled
  ✓ accepts a valid submission
  ✓ CORS preflight (OPTIONS) is handled
Tests: 5 passed, 5 total
```

**README with architecture diagram, setup, API docs** — see README.md
**Five submission-pack files present** — README.md, capstone.yaml, EVIDENCE.md, BUILDLOG.md, .env.example