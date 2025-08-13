## Operations Runbook (Initial)

### Health Endpoints
| Purpose | Endpoint |
|---------|----------|
| Basic liveness | /health |
| DB health & diagnostics | /health/db |
| Route mount status | /health/routes |
| Express route list | /health/express-routes |
| Recent requests (last 50) | /health/requests |

### Nightfall Core
| Action | Method | Endpoint | Headers |
|--------|-------|----------|---------|
| Create session | POST | /api/nightfall/sessions | X-API-Key |
| List sessions | GET | /api/nightfall/sessions | (optional) |
| Record player event | POST | /api/nightfall/sessions/:id/events | X-API-Key |
| List events | GET | /api/nightfall/sessions/:id/events | X-API-Key |
| Event summary | GET | /api/nightfall/sessions/:id/events/summary | X-API-Key |
| Metrics (runtime) | GET | /api/nightfall/sessions/:id/metrics | X-API-Key |
| Cold-load snapshot | GET | /api/nightfall/sessions/:id/state | (optional) |
| Cleanup stale runtime sessions | POST | /api/nightfall/maintenance/cleanup | X-API-Key |

### Dashboard
| Action | Method | Endpoint | Headers |
|--------|-------|----------|---------|
| Submit metrics | POST | /api/dashboard/submit-metrics | X-API-Key + (Bearer) |
| Submit feedback | POST | /api/dashboard/submit-feedback | X-API-Key + (Bearer) |
| Save analysis report (n8n) | POST | /api/dashboard/save-report | X-API-Key |
| List reports | GET | /api/dashboard/reports | X-API-Key + (Bearer) |
| Health | GET | /api/dashboard/health | X-API-Key |

### Environment Variables
| Key | Purpose |
|-----|---------|
| PORT | Server port |
| CLIENT_URL | CORS allowlist entry |
| DATABASE_URL | Postgres connection |
| NIGHTFALL_API_KEY | Protect Nightfall write endpoints |
| DASHBOARD_API_KEY | Protect dashboard endpoints |
| JWT_SECRET | Enable JWT verification |
| AUTO_MIGRATE | If 'true', run migrations on boot |
| RATE_LIMIT_WINDOW_MS | Rate limit window override |
| RATE_LIMIT_MAX_REQUESTS | Rate limit max per window |

### Routine Ops
1. Deploy change: push main -> Railway auto redeploy.
2. Verify /health and /health/db return success:true.
3. Create a session & record a test event (smoke test).
4. (Daily) Optionally trigger cleanup if many stale runtime sessions.
5. Monitor logs for "Slow query" lines.

### Incident Playbook
| Symptom | Likely Cause | Action |
|---------|--------------|--------|
| 404 on /api/nightfall/sessions | Route not mounted | Check /health/routes, redeploy if false |
| DB health false | Network / credentials | Verify DATABASE_URL env, redeploy |
| Snapshot not loading after restart | No persisted snapshot yet | Ensure full snapshot emitted by client, or add future manual snapshot route |
| High memory usage | Orphan sessions accumulating | Run cleanup endpoint |

### Roadmap Next (Planned)
1. Automated PDF report generation & storage.
2. Enhanced player reconnect & resume tokens.
3. Aggregated analytics endpoints (multi-session stats).
4. Background job queue (optional) for heavy tasks.
