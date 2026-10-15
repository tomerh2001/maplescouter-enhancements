# Centered Link Skill controls, 2026-10-15

Version: 1.7.12.

Centered Max level, Lv 2→3 and 380 as a group, retaining equal 20px gaps and aligned labels. This changes only the row's CSS alignment.

## Validation

- Supported browser with an isolated localhost:8800 default Mercedes result fixture; no real character saves or cloud writes.
- Desktop: 284px header, 19.87px left/right margins, 20px gaps, all three controls on one row.
- Phone: 390px page/viewport, 326px header, 40.87px left/right margins, 20px gaps and no overflow.
- Max level interaction checked. [Desktop preview](2026-10-15-link-centering/desktop.png).
- 163 tests passed; userscript syntax and whitespace checks passed. Both 1.7.12 packages built.
- Firefox lint: 0 errors, 11 existing warnings. Gecko runtime was not repeated for this alignment change.

## Store submissions

[Release v1.7.12](https://github.com/tomerh2001/maplescouter-enhancements/releases/tag/v1.7.12), source commit `e55b6c1`. [Release workflow 38682133111](https://github.com/tomerh2001/maplescouter-enhancements/actions/runs/38682133111) passed all jobs.

- Chrome: 1.7.12 accepted, `PENDING_REVIEW`, `DEFAULT_PUBLISH`.
- Firefox: 1.7.12 accepted, `PENDING_REVIEW`, listed channel, version ID `6579558`, source attached.

Automatic publication after approval remains enabled. No pending-version replacement was needed. Receipts are retained in the workflow artifacts.
