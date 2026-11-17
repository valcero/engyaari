# Postman collection run report

Collection: `postman/session-booking.postman_collection.json`
Runner: Newman (via `npx --yes newman run ... --reporters cli,json`), not added to package.json.
Raw results: `.agents/tasks/newman-results.json`

## DB target checked

- `src/config.ts` reads `MONGODB_URI` (required) and `PORT` (default 3000).
- `.env`: `MONGODB_URI` points at host `127.0.0.1:27017`, database `session_booking` (local). `PORT=3000`.
- MongoDB was already running locally (TCP 27017 accepted a connection). No DB services were installed or started.

## Server

- Nothing was listening on port 3000 before the run.
- Started with `npm run dev` (`tsx watch src/server.ts`) as a hidden background process; log showed `Server listening on port 3000`.
- Collection variable `baseUrl` = `http://localhost:3000`, so no `--env-var` overrides were needed.
- Server was stopped after the run (process tree killed; port 3000 confirmed free).

## Newman totals

| | executed | failed |
|---|---|---|
| iterations | 1 | 0 |
| requests | 11 | 0 |
| test scripts | 11 | 0 |
| assertions | 16 | 0 |

Total run duration: 1110 ms.

## Requests in order

| # | Request | Method | Status | Tests |
|---|---|---|---|---|
| 1 | Create User | POST /users | 201 | 201 Created: pass |
| 2 | Create User - duplicate email (409) | POST /users | 409 | 409 Conflict: pass |
| 3 | Create Teacher (helper) | POST /teachers | 201 | 201 Created: pass |
| 4 | Create Session | POST /sessions | 201 | 201 Created: pass |
| 5 | Create Session - endTime before startTime (400) | POST /sessions | 400 | 400 Bad Request: pass |
| 6 | Available Sessions | GET /sessions/available?dateTimestamp=1893492000000 | 200 | 200 OK: pass; contains the new session: pass |
| 7 | Book Session | POST /sessions/:id/book | 200 | 200 OK: pass; status is BOOKED: pass |
| 8 | Book Session again (409) | POST /sessions/:id/book | 409 | 409 Conflict: pass |
| 9 | User Sessions (upcoming) | GET /users/:id/sessions | 200 | 200 OK: pass; 1 upcoming: pass |
| 10 | Complete Session | PATCH /sessions/:id/complete | 200 | 200 OK: pass; status is COMPLETED: pass |
| 11 | User Sessions (completed) | GET /users/:id/sessions | 200 | 200 OK: pass; 1 completed: pass |

## Failures

None.

## Notes

- The run wrote one user, one teacher, and one session to the local `session_booking` database. They were not cleaned up.
- Newman 6 rejects `--no-color`; `--color off` is the accepted flag. This only affects console output.
