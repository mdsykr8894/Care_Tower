# Care Tower v1.1 — Change Log

## Completed for the local classroom version

- Preserved v1.0 pastel school illustration, tower graphics, player UI and audio.
- Changed the round sequence to Stack → feedback → Quiz → feedback.
- Preserved the 700 quiz / 300 stacking score allocation and ten original answer keys.
- Calculated stack position and grade using elapsed time measured on the server, not the client's submitted `elapsed` value.
- Added action IDs and response replays to prevent duplicate scoring during repeated requests.
- Made the quiz answer keys server-private during HTTP multiplayer play; offline file demo uses separate blocked-by-server answer file.
- Added persistent browser token, action retry, reduced player polling, network indicator, presence counter and resume of the current phase.
- Made Canvas animation use frozen game time during presenter Pause and disabled game interactions during pause.
- Reworked presenter into one tab, with automatic lobby/live/results states and on-demand review. Presenter routes can be deep-linked in the same tab.
- Added lobby QR, joined/connected counters; live Top 7, timer, completed count; Top 3 podium and Top 10 final; analysis of 10 questions with distinct unanswered count.
- PIN protected presenter action APIs, concealed the PIN after login, and added confirm steps for End and Reset.
- Adjusted mobile viewport, safe area and shell alignment in an attempt to address iPhone top gap.
- Expanded Node tests to 13 (including HTTP integration).

## Requires real-device verification

- Safari iPhone safe-area / toolbar behavior, small Android displays, projector layout at 1280×720 and 1920×1080.
- Sound effects on Safari/Android and 40 simultaneous physical devices.
- UI animation inspection. The available browser sandbox blocked automated screenshot navigation.

## Deferred: Vercel / internet deployment

- Replace single-process in-memory state and SSE with cloud-compatible shared authoritative storage and updates (e.g. Supabase/Redis) before Vercel deployment. This local server is NOT cloud deployment ready.
