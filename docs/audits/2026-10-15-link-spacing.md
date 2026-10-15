# Link comparison control spacing, 2026-10-15

Version: 1.7.11.

The native header used `justify-between`, spreading Max level, Lv 2→3 and 380 across the card. The controls now form a left-aligned group with equal 20px gaps. Max level uses the same label line height as its neighbors. Wrapping remains available for narrower containers; calculation and toggle behavior are unchanged.

## Validation

- Supported browser with the isolated localhost:8800 default Mercedes result fixture, without real character edits or cloud writes.
- Desktop: 284px header client/scroll width; all three controls 18px tall and vertically aligned, with 20px gaps.
- Phone: 390px viewport and page width; 326px header client/scroll width, 20px gaps, all controls on one row.
- Max level remained functional. [Desktop preview](2026-10-15-link-spacing/desktop.png).
- 163 existing tests passed; userscript syntax and whitespace checks passed. No new tests for this CSS-only adjustment.
- Chrome and Firefox 1.7.11 packages built. Firefox lint: 0 errors, 11 existing warnings. Gecko runtime was not repeated for this CSS change.

## Store submissions

Pending release workflow.
