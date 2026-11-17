# Session Booking API

REST API where teachers publish sessions, users book them, and completed sessions appear in the user's history.
Stack: Node.js, TypeScript, Express 5, MongoDB, Mongoose (validation with Zod).

## Setup

Requirements: Node.js 20+, a running MongoDB instance.

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # development (auto-reload)
# or
npm run build && npm start
```

Environment variables (`.env`):

| Name | Description | Default in `.env.example` |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/session_booking` |

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/users` | Create user (`fullName`, `email`, `phone`). Duplicate email returns 409. |
| POST | `/teachers` | Create teacher (`fullName`, `email`, `specialization`, `experience`). Helper endpoint so sessions can be created. |
| POST | `/sessions` | Create session (`teacherId`, `startTime`, `endTime`). Status defaults to `AVAILABLE`. |
| GET | `/sessions/available?dateTimestamp=<ms>` | AVAILABLE sessions starting on that UTC day (aggregation pipeline). |
| POST | `/sessions/:id/book` | Body `{ "userId": "..." }`. Only AVAILABLE sessions can be booked. |
| PATCH | `/sessions/:id/complete` | Only BOOKED sessions can be completed; sets `completedAt`. |
| GET | `/users/:id/sessions` | `{ upcomingSessions, completedSessions }` (aggregation pipeline with `$facet`). |

## Behaviour notes

- `dateTimestamp` is epoch milliseconds. The "date" is the UTC calendar day containing it.
- Upcoming sessions are the user's BOOKED sessions, sorted by start time. Completed sessions are sorted by `completedAt`, newest first.
- Booking and completing use one atomic conditional update, so concurrent requests cannot double-book.
- Status codes: 200/201 success, 400 validation, 404 missing user/teacher/session/route, 409 conflict (duplicate email, wrong session state), 500 unexpected.
- Errors have the shape `{ "error": "message", "details": [...] }` (`details` only for validation errors).

## Postman

Import `postman/session-booking.postman_collection.json` and run the requests in order. Test scripts store `userId`, `teacherId`, `sessionId` and `dateTimestamp` as collection variables. `baseUrl` defaults to `http://localhost:3000`.

## Structure

```
src/
  config.ts  app.ts  server.ts  routes.ts
  controllers/  services/  models/  middleware/  utils/
```
