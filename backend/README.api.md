# Backend Quick API Notes

This file documents a few endpoints added to improve frontend compatibility and developer experience.

## New & notable endpoints

- POST /api/events/create
  - Compatibility wrapper that creates an event (same as POST /api/events)
  - Payload: { title, date, ... }

- POST /api/admin/events/:id/update
  - Protected (requires organizer role). Update event fields by id.
  - Payload: partial event object

- GET /api/admin/export?type=registrations[&eventId=<id>]
  - Protected (requires organizer role). Exports CSV data.
  - type=registrations (default) or type=events
  - Optional eventId filters registrations for a single event

- GET /api/predict/examples
  - Returns sample prediction cards to preview on frontend (public)
- GET /api/stats
  - Public compatibility endpoint that returns the same dashboard stats as `/api/admin/stats` without requiring authentication
- GET /api/crops/marketplace
  - Alias for `/api/crops/all` for older frontends expecting `/marketplace`

- POST /api/predict
  - Accepts multipart/form-data with `image` and optional `cropType`.
  - Currently returns a mocked grade object; replace with ML service when available.

## Dev utilities

- `node scripts/smokeTest.js` or `npm run smoketest` (from backend folder)
  - Quick script that hits health endpoints and prints status. Useful for local sanity checks.

## Notes

- Admin endpoints are protected using `protect` and `authorize('organizer')`; ensure you are authenticated and authorized when testing.
- Export endpoints return `text/csv` with `Content-Disposition` for direct download in browsers.
