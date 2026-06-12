# Test Specifications

## Unit Tests (Vitest + React Testing Library)

### DecisionLogger.test.tsx
- [ ] renders without crash
- [ ] input field is auto-focused on mount
- [ ] typing into decision field updates the input value
- [ ] typing into prediction field updates the input value
- [ ] moving confidence slider updates the displayed value
- [ ] pressing Enter with all fields filled saves the commit
- [ ] pressing Enter with empty decision text shows validation message
- [ ] pressing Enter with empty prediction text shows validation message
- [ ] after saving, input fields are cleared and ready for next commit
- [ ] Cmd/Ctrl+G keyboard shortcut focuses the input field

### AccuracyScore.test.tsx
- [ ] renders without crash
- [ ] displays "No resolutions yet" when no commits are resolved
- [ ] calculates correct percentage: 2 correct out of 3 total resolved = 67%
- [ ] counts partial resolutions as half-correct in score
- [ ] updates displayed score when a commit is resolved
- [ ] shows total counts: correct, incorrect, partial

### DecisionCard.test.tsx
- [ ] renders without crash
- [ ] displays decision text, prediction text, confidence level, hash, and timestamp
- [ ] shows "Unresolved" badge when not yet resolved
- [ ] clicking resolve button reveals correct/incorrect/partial buttons
- [ ] clicking a resolution option updates the commit status
- [ ] shows resolved badge with the chosen resolution

### useDecisions.test.ts
- [ ] initializes with empty array when no localStorage data
- [ ] addCommit creates a commit with unique hash, timestamp, and all fields
- [ ] addCommit persists to localStorage
- [ ] resolveCommit updates the status of a specific commit by hash
- [ ] resolveCommit persists updated data to localStorage
- [ ] getAccuracy returns 0 when no resolutions exist
- [ ] getAccuracy returns correct percentage based on resolutions
- [ ] hashes are unique across multiple commits

## User Journey Tests

### Primary Workflow — Log a Decision
1. App loads → input field is focused, accuracy score shows "No resolutions yet", feed is empty
2. User types decision "Pivot to enterprise" → prediction "ARR doubles in 6 months" → sets confidence to 8
3. User presses Enter → commit appears in feed with hash (e.g. `a3f1`) and timestamp
4. Input fields clear → ready for next commit
5. Page reloads → commit persists in feed from localStorage

### Resolution Workflow
1. User has 3 unresolved commits in feed
2. User clicks resolve on first commit → sees correct/incorrect/partial options
3. User clicks "Correct" → commit shows "Correct" badge, accuracy score updates to 100%
4. User resolves second commit as "Incorrect" → accuracy score updates to 50%
5. Accuracy score persists after page reload

## Acceptance Criteria Checklist
(Reviewer verifies these against PRD.md features)
- [ ] AC: Pressing Cmd/Ctrl+G focuses the decision input; after filling decision text, prediction text, and confidence slider, pressing Enter saves the commit to localStorage with a unique hash and timestamp, and the commit appears in the feed below within 100ms. An empty decision text field shows a validation message and does not save.
- [ ] AC: Clicking a resolve button on a past commit presents correct/incorrect/partial options; selecting one updates the commit's status, recalculates the accuracy percentage, and the new score renders within 100ms.
