# My Profile + HRMS (attendance, shifts, leave, holidays) — runbook

Branch `feat/profile-hrms` (from `release/rbac-emi-desktrack` 9b6b747). Built and tested on the box only.

## Database (add-only)

`MIGRATION-HRMS-PROFILE.sql` — `CREATE TABLE IF NOT EXISTS` only, re-runnable, no change to old tables:

| table                   | what                                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `staff_profiles`        | one row per staff `(user_source, user_id)`: employee ID, designation, department, joining date, own shift (`shift_start`/`shift_end`, `shift_locked`), grace minutes, weekly off, photo, personal + emergency details, ID card status |
| `hr_attendance_records` | one row per staff per day: present / late / half day / WFH / absent / leave / holiday / week off, check-in/out (IST), late minutes, who marked it                                                                                     |
| `hr_holidays`           | holiday calendar (`is_active = 0` = removed, kept for history)                                                                                                                                                                        |
| `hr_leave_requests`     | leave applied from My Profile; HR approves / rejects with a remark                                                                                                                                                                    |

**Not applied on live.** Apply only with the owner's approval, after a full backup.
The API works before the tables exist: My Profile shows the old details, HR screens say "tables not added yet", writes return 503 `HR_TABLES_MISSING`.

## Rules

- Office window 08:30–19:30 IST; each person picks a 9-hour shift starting 08:30…10:30 (15-minute steps) on My Profile. HR can override or lock it on Employees. Every change is in Activity Logs.
- Late = check-in after own shift start + grace (`late_grace_minutes` per person, else `HR_LATE_GRACE_MINUTES`, default 30). No shift chosen → late not worked out.
- Leave days skip the person's weekly off (default Sunday) and holidays. Approving leave marks those days on the sheet (never over a day HR marked present / WFH).
- No leave quotas: My Profile shows approved leave days used per type this year only. No balance, no limit enforced.

## Access (Users & Access → Options → HR)

`hr:attendance_view`, `hr:attendance_manage`, `hr:leaves_approve`, `hr:holidays_manage`, `hr:employees_manage` (+ existing `hr:view`).
Super Admin / Admin have all; HR Manager role (14) has them by default; give them to any employee as extra options.
Nobody approves their own leave (except Super Admin / Admin). Only Super Admin edits a Super Admin record.

## API

- `/v1/crm/profile/*` (any signed-in staff, own data): `GET/PATCH /me`, `PUT /me/shift`, `POST /me/photo`, `GET /photo/:file`, `GET /me/attendance?month=YYYY-MM`, `GET /holidays?year`, `GET/POST /me/leaves`, `POST /me/leaves/:id/cancel`
- `/v1/crm/hrms/*` (HR options): `overview`, `attendance/daily|mark|bulk|monthly|export`, `leaves`, `leaves/:id/approve|reject`, `holidays` (+ `/:id`, `/:id/apply`), `employees` (+ `/:source/:id`, `/photo`)
- `/v1/crm/attendance` and `/v1/hr/workforce-summary` now return real numbers (no more dummy figures; payroll/accounts = null).

## Photos

`<home>/domains/api.dnyanvedh.com/uploads-persistent/staff-photos` on Hostinger (`STAFF_PHOTOS_DIR` to override). JPG/PNG/WEBP, 2 MB, contents checked, random names, streamed only to signed-in staff. Old photos are read (never written) from `etaxwala.com/public_html/public/profiles` (`LEGACY_PROFILE_PHOTOS_DIR`).
