# Desktrack (desktop tracking) — old-flow parity

Old code: etaxwala.com `DesktopController`, `SystemLogController`, `BlockedWebsiteController`,
views `resources/views/desktrack/*`. New code: `src/routes/desktrack.routes.ts`,
`src/services/desktrack.service.ts`, `src/services/desktrack-rules.ts` (pure, unit-tested),
`src/routes/desktop-client.routes.ts`, web `features/crm/crm-desktop-tracking-page.tsx`.

Tables (all existing, shared with etaxwala.com): `system_logs`, `desktop_users`,
`blocked_websites`, `users`, `ips` (already on live; the API still checks information_schema first).

## Access

Super Admin, Admin and Operations Manager (`requireRole([1,2,3])`). The old sidebar showed
"Manage Desktrack" to Admin (user_type 2) and OM (4) only; the old URLs themselves only checked
"logged in", so any staff could open them — that gap is closed. `POST /logout-event` stays open
to every signed-in staff member, like the old `/user/logout-event`.

## Endpoints (`/v1/crm/desktrack`, also `/v1/staff/desktrack`)

| Endpoint                                                | Old equivalent                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `GET /tracking?user_id&from&to&page&limit`              | `desktop_report` + `desktop_report_filter`                          |
| `GET /sessions` (alias `/idle`)                         | `desktop_report_idle` + `idle_report_filter`                        |
| `GET /logins/:loginId/screenshots?page&limit&scope=all` | `get-screenshots/{id}` (paged, metadata only)                       |
| `GET /screenshots/:id`                                  | BLOB from `system_logs.screenshot_path`, MIME sniffed like `finfo`  |
| `GET /live?date`                                        | new: polled live board (no WebSockets)                              |
| `GET/POST/PUT /desktop-users`                           | new UI for `desktop_users` (client config)                          |
| `GET/POST/PUT/DELETE /blocked`                          | `/block-website`, `/unblock-website`, `/blocked-websites/{user_id}` |
| `GET/POST/PUT/DELETE /ips`                              | `manage_ips`, `add-ip-address`, `updateIP`, `deleteIP`              |
| `GET /staff?scope=tracking                              | session`                                                            | the old employee dropdowns |
| `POST /logout-event`                                    | `/user/logout-event`                                                |

## Numbers (identical to the old screens)

- Tracking: one row per `login` event; logout = first `logout` after it (any day, as before).
  `old_display` reproduces the old "(Live)" / "(Auto-logout)" label exactly. `state` is the
  intended rule: live while screenshots keep arriving (≤ 30 min), auto-logout after 30 min
  silence, logged out on a real logout, "no logout" for old sessions that never closed.
  (The old SQL's "screenshot within 30 min after the last one" sub-count is always 0, so the old
  screen showed every session with no screenshots as "(Live)" forever.)
- Session report: the old CTE verbatim (first/last screenshot per user per day; idle = idle
  events × 5 min; Working Time = `TIMEDIFF(logout, login)`); lunch/meeting/outside from the
  old `calculateActivityTimes()` switch/close rules; `hms()` = PHP `gmdate('H:i:s')`.
- Screenshot viewer: default is this session (login → next login); "Everything after this
  login (old view)" gives the old unbounded set.
- Times are the stored wall-clock strings. Laravel writes Asia/Kolkata `now()` into TIMESTAMP
  columns on a UTC MySQL session; new writes do the same (`istNow()`).

Checked against the real old controller (PHP 8.2, same DB copy):
`/workspace/etax-new/desktrack/parity_check.py` — 718 checks, 0 differences.

## Desktop client

The installed Desktrack client posts to `etaxwala.com/api/*` (`log-event`, `upload-screenshot`,
`idle-notification`, `user-desktop-login`, `get-idle-limit`, `get-screenshot-interval`,
`blocked-websites/{user_id}`). etaxwala.com stays live on the same database, so the client keeps
working unchanged and the new dashboard shows its rows immediately.

The same endpoints exist on the new API under `/api/*` with the same JSON shapes, off by default
(`DESKTRACK_CLIENT_API_ENABLED=true` turns them on) for when the client is repointed. Changes:
desktop login checks the password like the web login and returns 401 when wrong (old: empty 200);
`user_id` must exist; `/api/block-website` and `/api/unblock-website` (no auth in the old app)
return 403 — manage the list in the CRM; `/api/screenshots/{id}` is not exposed (old method did
not exist; screenshots are served only behind staff login).

## Old features that never worked on live

- Old Manage IPs page errored (no `ips` table at the time) and had no menu link. The table now
  exists on live; the new page shows a notice if it is ever missing.
- Old Block Website page was a stub (empty table, form posted to the lead form). Old
  "block website for IP" wrote a `device_ip` column that does not exist.
- Block-website end to end: the Windows client calls `GET etaxwala.com/api/blocked-websites/{user_id}`
  (no auth) and receives a JSON array of `website_url` strings for that `users.id` (the id
  returned by `user-desktop-login`). The new CRM writes `user_id` + a host-only `website_url`
  (e.g. `www.youtube.com`, same as the only historical live row). The old admin path never
  wrote `user_id`, so the client almost never received a list. The live row (`user_id` 44,
  `www.youtube.com`) is an orphan — that id is not a `users` row, so no signed-in PC will
  fetch it. We cannot confirm the installed client actually enforces the list (no client
  source); if it does, a new block on a real staff login will be visible on the next client
  poll of etaxwala.com. Do not change etaxwala.com.
- On this line `POST /v1/crm/employees` and `PUT /v1/crm/employees/:id` (crm.routes) still write
  `desktop_users` rows (left unchanged); prefer Desktrack → Desktop users.

## This line (Madhur main)

Ported from cee649d. Web UI helpers live in `apps/web/src/features/crm/desktrack/desktrack-ui.tsx`
(this app's look). `blocked_websites` inserts use bound raw SQL because this schema's model has no
id default. Desktop login checks bcrypt then the plaintext column, without upgrading hashes.
