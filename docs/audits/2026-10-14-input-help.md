# UI, skill cards and input help, 2026-10-14

Release: 1.7.8. This report includes the interactive tooltip revisions and the following public-route and class audit. Store receipts will be recorded after submission.

## Changes

- Use the site's native tooltip component and animation. A control, its label and padding share one trigger. Moving within the same control or returning during its fade does not restart the entrance animation.
- Combine simple native skill/buff card tooltips into one centered title and smaller detail. Link cards keep the class title and skill-name subtext. Guild and Legion Champion bonuses follow the current inputs.
- Keep only useful field help and remove redundant filler. Metric help uses the whole label/value row. The result summary has no added icons or layout changes.
- Keep the requested Destiny names: Destiny 2 Liberated on input, Destiny 2 Buff in ring comparisons, First Legacy Buff in the explanation.
- Restore the original character-option layout at the user’s request; retain only their names and help. Mu Gong shows “+25% ATT/MATT.” with “Lv. 1: 10s; Lv. 2: 20s.” as subtext, without a region prefix or cooldown.
- Keep wide tab groups on one horizontally scrollable line. Selecting WSE Potential scrolls it into view and preserves the native selected state and panel.
- Keep the character picker and cloud button inside the phone card. Fix overflow in desktop navigation, Training Grounds filters, Challenge actions, Treasure Hunter, Level Simulator, Rebirth Flame controls and Item Maker selects. Wrap Boss Info names and Legion ranking headings.
- Correct Phantom and Corsair display names. Describe Sia/Erel's unnamed mastery card placeholders as Unreleased Mastery Skill, without assigning invented icons or changing calculations.
- Translate missing Prime Cube/first-line-lock UI. Retain the native `N기` season replacement token: the existing runtime translation handles it after substitution.
- GMS Link Skill suggestions retain maximum active effects without an extra toggle or explanatory caption.

## Coverage and results

- Refreshed 68 public routes and 190 current JavaScript chunks with no fetch/parse failures. Browser checks also included the two challenge routes containing underscores, for 70 routes total.
- [Route coverage](2026-10-14-input-help/route-coverage.json): initialized DOM layout checks at 1280 and 390 CSS pixels. Text clipping, page overflow and loaded-image failures were sampled across the rendered main content. Targeted follow-ups included 354px Item Maker, optimizer and profile layouts. This is not a claim that every interaction or all dynamically loaded records were exercised.
- Browser-selected every one of 54 classes on Character and inspected its skill cards. Independently fetched all 639 nonempty unique image URLs from the current class skill catalog: all returned images successfully. [Class coverage](2026-10-14-input-help/class-coverage.json).
- Sia's current input panel showed SHINE Tree of Stars and Sia-specific skill images. The reported Freud mismatch was not reproduced. Sia/Erel's third and fourth mastery slots are still placeholders in the current site and skill reference; their icons were not replaced with guesses.
- Visually checked the character options, picker, Mu Gong help, result metrics, scrollable Links/Potentials tabs, Boss Info, and representative mobile calculator/simulator layouts. Existing native result values and controls were preserved.
- Links/Potentials at desktop: all three tabs share a row; the native WSE tab becomes selected and its container scrolls horizontally. The row's content was 330px wide inside a 284px viewport.
- Earlier focused checks: guild Lv. 7 shows +14% Boss Damage and Champion ATT Lv. 4 shows +20 ATT/MATT. Mouse movement inside a control does not restart its tooltip. Keyboard focus and Escape remain supported.
- `node --test test/*.test.*`: 153 passed. Syntax and whitespace checks passed. Both 1.7.8 packages built. Firefox lint: 0 errors and 11 existing warnings (Android minimum-version compatibility and dynamic innerHTML assignments).

## Limits

Character Info, Weekly Boss Income and the two Legion character pages were limited by absent character API data in this test context. Farming EXP showed an error state; Outfit Analysis had no character content. Signed-in account features, all ranking records, every simulation combination and Firefox runtime were not exercised in this pass. Asset availability does not prove the semantic correctness of every icon; there is no claimed Freud fix without a reproduction.

The audit used the local proxy and isolated test drafts for class switching. Once the user began using that preview origin, later checks only navigated and inspected it; saved characters were not replaced or uploaded.

## References

- [Memories, current GMS skill data](https://maplestorywiki.net/w/Memories): attack bonus and level-dependent duration.
- [Heroic](https://maplestorywiki.net/w/Heroic): +45% Final Damage at Lv. 250+.
- [Sia Astelle skills](https://maplestorywiki.net/w/Sia_Astelle/Skills): current mastery placeholders and Tree of Stars.
- [SHINE Tree of Stars](https://maplestorywiki.net/w/SHINE_Tree_of_Stars): shared Sia/Erel skill.
- Guild/Champion field limits and arithmetic were checked against the live site chunks. These descriptions do not alter damage calculations.

[Scrollable native tabs](2026-10-14-input-help/scrollable-tabs.png)
