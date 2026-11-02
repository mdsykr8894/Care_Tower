# Care Tower v1.2 — Changelog

## Fixed
- Presenter live/final ranking rendering (`pos` undeclared).
- Responsive live lobby now shows all joined participant nicknames.
- Production join QR uses website domain, not local IP dropdown.
- Podium doesn't create placeholders for absent second/third winners.

## Added
- Vercel Node.js serverless handler (`api/handler.js`).
- Private Vercel Blob optimistic state storage (`server/blob-store.js`).
- Polling fallback in player and presenter cloud mode (local SSE still works).
- Vercel build excluding offline demo answer keys.
- DOM presenter tests, cloud API mock tests, 40-way optimistic concurrency mock tests.

## Deferred / validation needed
- Real Vercel account + real Blob credential deployment and multi-device latency test.
- iOS Safari physical visual checks.
- Optional Redis backend for higher write throughput if Blob retries are unsuitable.
