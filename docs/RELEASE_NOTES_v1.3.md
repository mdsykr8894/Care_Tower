# Care Tower v1.3 — Polish, iPhone audio & latency fixes

This is an incremental update from Care Tower v1.2; the approved cozy art and all 10 quiz questions remain intact.

## Completed
- Unified Malay UI copy (outside the questions), translated theme labels, and consistent SVG icons for main functions.
- iPhone-friendly minimum touch targets and quiz card layout; improved player audio control with visible Mati/Hidup label and test chime.
- Sound remains off by default; resumes audio context when possible on return to Safari/browser tab.
- Optimistic block landing: animation starts on tap, then reconciles with server-verified result.
- Limited 110 ms time compensation for plausible network delay. Not fully cheat-proof.
- Single in-flight player sync, monotonic revision handling, less frequent cloud heartbeats, better 5xx errors, up-to-date player leaderboard.
- Presenter cloud polling no longer overlaps and ignores out-of-date state responses.
- Optional latency diagnostics at `?debug=1` (`window.__careTower.metrics`).

## Double-check
- **28/28 Node.js tests pass.**
- **Browser simulation:** mobile home, lobby/waiting, quiz, audio button, live/final presenter rankings rendered with no JavaScript errors.
- **Simulated 800 ms network delay:** stacking animation began in **1 ms** (observed in this test) instead of waiting for server; confirmation arrived about 802 ms later. These are one simulation's results, not guaranteed timings.
- **Build:** `dist/` generated, `demo-answers.js` excluded and `icons.js` present.

## Not yet verified
- Physical iPhone Safari audio, safe areas and performance.
- Real Vercel deployment / Private Blob latency under 40 real connected phones.
- Redis or another real-time store has NOT been added. A single Blob JSON record can still become a contention bottleneck; if field testing shows significant 503 errors or slow scoring, moving to an atomic data store is strongly recommended.

Full QA checklist: `docs/QA_v1.3.md`.
