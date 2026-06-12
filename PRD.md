# gut.sh — Product Requirements Document

## Problem
Visionary founders make bold decisions on instinct every day, but have no fast, rigorous way to track whether their gut is actually right over time. Without a feedback loop, they either second-guess every call and move too slow, or leap blindly and never refine their intuition. Existing tools are dashboards that report what happened yesterday — none commit a prediction in the moment and score it later.

## Target Users
Early-stage founders and solo decision-makers who regularly ship high-conviction choices (product pivots, hire/fire calls, market bets) and want empirical proof that their intuition is compounding — not just a gut feeling about their gut feeling.

## Core Feature
- **Decision Commit**: Founder presses a global keyboard shortcut (Cmd/Ctrl+G) or clicks directly into the always-visible input field, types what they decided, what they predict will happen, and sets a confidence level (1–10 slider). Pressing Enter "commits" the decision with a timestamp and a short hash (e.g. `a3f1`). The entire flow completes in under 5 seconds. — Acceptance Criteria: Pressing Cmd/Ctrl+G focuses the decision input; after filling decision text, prediction text, and confidence slider, pressing Enter saves the commit to localStorage with a unique hash and timestamp, and the commit appears in the feed below within 100ms. An empty decision text field shows a validation message and does not save.

## Should Have
- **Resolution & Accuracy Score**: Any past commit can be resolved as correct, incorrect, or partial. An accuracy score (percentage of correct+partial resolutions) is calculated and displayed prominently. The score updates in real-time as resolutions are made. — Acceptance Criteria: Clicking a resolve button on a past commit presents correct/incorrect/partial options; selecting one updates the commit's status, recalculates the accuracy percentage, and the new score renders within 100ms.

## Out of Scope (v1)
- **Team/shared decision logs** — multi-user collaboration would add auth, sharing, and permissions that dilute the single-player focus. gut.sh is personal first.
- **AI-powered prediction analysis** — suggesting outcomes or auto-scoring decisions sounds powerful but introduces API dependency and noise. The founder's own judgment is the point.
- **Integrations with project management tools** (Jira, Linear, Notion) — linking commits to external tasks adds complexity and slows the 5-second logging flow. v1 stays self-contained.
- **Mobile app / native hotkey** — desktop browser is the primary context; global OS-level hotkeys require Electron or native builds, which multiplies scope.

## Success Metrics
- Primary: Founder logs a decision commit in < 5 seconds from hotkey press to saved entry (measured by timestamp delta between open and save).
- Secondary: At least 1 resolution is made per 3 commits logged (indicating users return to close the loop).

## Design Principles
- **Terminal-speed interaction**: The UI should feel like a git commit — minimal chrome, zero ceremony, type and enter. No onboarding modals, no tooltips blocking the first action.
- **The hero IS the commit form**: On page load, the input field is focused and ready. The accuracy score is visible but secondary. No "Get Started" button, no landing page above the tool.
- **Professional restraint**: Clean monospace accents for hashes, red (#EF4444) for key CTAs, system font for body. Nothing playful — this is a serious tool for serious decision-makers.
