# Changelog

Changes in each version of MapleScouter Enhancements. Dates are GitHub release publication dates in Asia/Jerusalem. Historical entries were reconstructed from release commits and dated audits; store approval dates may differ.

Every release must have a completed entry here before its version is published. GitHub Releases, release workflow summaries and Firefox submission notes use the matching entry. Detailed validation and coverage limits remain in [the audit reports](docs/audits/).

## [Unreleased]

- Track version history in this file and require matching release notes before publication.
- Show version-specific changes in GitHub Actions summaries and use them for GitHub Releases and Firefox submission notes.
- Check changelog changes on pull requests and main without creating a new extension release.

## [1.7.17] - 2026-10-31

- Failed Base Combat Power and Final Damage previews now show an unavailable state and a Retry action instead of leaving unexplained zero values.
- Stalled previews and manual Result requests stop waiting after 65 seconds. Late responses cannot replace results after the relevant inputs or route change.
- Retries preserve saved inputs and use the site’s existing calculation service and security verification. This does not resolve an unavailable upstream service.
- Simplified the README and expanded the maintenance checks for failed and stalled calculations.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.16...v1.7.17)

## [1.7.16] - 2026-10-28

- Translated boss phase-plan popups, including burst-on-entry, mini-burst timing, Ascent casts, Kalos subphases and curse stacks.
- Fixed Type A/Type B switching so translated phase rows update correctly without detaching React-owned elements.
- Kept long boss-plan popups within the viewport with internal scrolling on small screens.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.15...v1.7.16)

## [1.7.15] - 2026-10-26

- Added support for the new manual input, result, HEXA and optimizer workspace while retaining the original routes.
- Restored character presets, contextual help and GMS Link Skill suggestions on the new pages; Max level now reads the correct manual result.
- Kept the selected manual tab visible on narrow screens and restored layout fixes immediately after React hydration.
- Translated new navigation, account-linking, profile-border and equipment text, plus dynamic time and ranking labels. Preserved the exact account-deletion confirmation token.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.14...v1.7.15)

## [1.7.14] - 2026-10-15

- Kept the open character picker within the screen when opened, filtered or resized, including narrow phone widths.
- Delayed the input form’s two-column layout until 800px so the buffs column fits on tablets.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.13...v1.7.14)

## [1.7.13] - 2026-10-15

- Replaced broken images for explicitly unreleased skills with accessible placeholders in input and result cards, without changing skill levels or calculations.
- Translated shortened Cadena skill names, HEXA reset-refund totals, dynamic EXP and duration messages, and additional ranking, Dojo and reward text.
- Fixed wrapping of ranking filters and challenge actions; kept the Dojo table scrollable inside its card.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.12...v1.7.13)

## [1.7.12] - 2026-10-15

- Centered the Max level, Lv 2→3 and 380 controls in the Link Skill comparison row.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.11...v1.7.12)

## [1.7.11] - 2026-10-15

- Evened out spacing between the Link Skill comparison controls.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.10...v1.7.11)

## [1.7.10] - 2026-10-15

- Added Sia Astelle/Erel Light’s Guiding Stars to the sorted Link Skill suggestions with its game icon and shared-level handling.
- Ranked Guiding Stars by Critical Damage; its tooltip also shows Buff Duration, which is not included in the efficiency score.
- Removed the bottom explanatory paragraph and Link Skill Eff heading; placed Max level first in the controls.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.9...v1.7.10)

## [1.7.9] - 2026-10-14

- Added Max level to compare full Link Skill bonuses at their GMS caps, including shared Explorer, Cygnus and Zero skills.
- Kept Lv 2→3 as the upgrade-only comparison. Selecting either comparison mode clears the other.
- Ranked all 26 damage candidates in maximum-level mode instead of rescaling only the native top 15.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.8...v1.7.9)

## [1.7.8] - 2026-10-14

- Added concise input and result help using the site’s native tooltip and animation. Labels and controls share a trigger, and returning during a fade does not restart the entrance animation.
- Combined overlapping buff tooltips and made guild and Legion Champion bonuses follow the entered values.
- Clarified Destiny 2 Liberated, Destiny 2 Buff, Mu Gong Soul, Wild Hunter Legion and result metrics while preserving native character-option and result-summary layouts.
- Kept wide tab groups horizontally scrollable and fixed clipping across navigation, character controls, ranking filters and several calculators.
- Corrected class labels and missing Prime Cube text. GMS links now assume maximum active effects without a separate toggle or caption.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.7...v1.7.8)

## [1.7.7] - 2026-10-14

- Added Hayato, Kanna, Lynn and Mo Xuan to GMS Link Skill efficiency suggestions, including Lv. 2 to 3 comparisons and an active-effects toggle.
- Excluded Lethe’s KMS-only link from GMS suggestions, corrected Qi Cultivation’s name and translated Erel Light.
- Added an explanatory Guiding Stars note; numerical ranking was added later in 1.7.10.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.6...v1.7.7)

## [1.7.6] - 2026-10-08

- Translated the Soul Amplification simulator, Soul Potential rerolls, guarantee progress, Inner Ability constraints and new ranking filters.
- Fixed a React crash after successful Soul amplification by preserving the simulator’s text nodes.
- Fixed phone layouts for simulator tables and cost controls, and made Training Grounds season labels and descriptions update together.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.5...v1.7.6)

## [1.7.5] - 2026-10-05

- Updated repository, download and support links for the rename to maplescouter-enhancements while preserving extension identities and userscript namespaces.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.4...v1.7.5)

## [1.7.4] - 2026-09-24

- Translated the new Inner Ability tools, Soul Potential and equipment repair, HEXA reset guidance, Star Force restoration and ranking filters.
- Fixed phone layouts for ability lines and cost controls, and corrected ranking timestamp translations.
- Fixed equipment menus that could become blocked by stale tooltip copies. Interactive menus are no longer pinned; informational tooltips still support pointer-leave and Escape dismissal.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.3...v1.7.4)

## [1.7.3] - 2026-09-17

- Added September translations for the stat quiz, class analysis, pet controls, symbol migration, scheduler messages and potential probability tables.
- Fixed split and multiline translations, decimal Korean number units and complete HEXA skill labels.
- Kept the selected language when opening Detailed Information and improved quiz label wrapping on phones.
- Added a live-build audit baseline and reproducible locale parsing for weekly maintenance.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.2...v1.7.3)

## [1.7.2] - 2026-09-07

- Refresh cloud status when opening the Character page or picker and when returning to the tab; show a neutral state while checking instead of stale green status.
- Use consistent Local and Cloud save-date wording with seconds, minutes, hours, days, months and years.
- Added GitHub Actions submissions to Chrome and Firefox with automatic publication after store approval.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.1...v1.7.2)

## [1.7.1] - 2026-09-07

- Loading a saved character now selects its saved GMS, KMS, TMS, JMS or MSEA region.
- Blocked cloud requests, server failures and invalid responses now show unavailable status. Avatar failures no longer change character sync status, and local saves remain usable offline.
- Included the Firefox package and reviewer build instructions added since 1.7.0.
- A companion cloud-service configuration change removed country-based request blocking; that server fix also applies to older extension versions.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.7.0...v1.7.1)

## [1.7.0] - 2026-09-04

- Added character avatars from the public GMS rankings to the picker and character dialogs.
- Simplified add-from-cloud prompts and added Delete local, Delete cloud and Delete both choices.
- Delete both removes the cloud copy first and retains the local copy if the cloud deletion fails.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.6.0...v1.7.0)

## [1.6.0] - 2026-09-04

- Renamed the extension to MapleScouter Enhancements.
- Fixed saving and overwriting the wrong character, dropped edits during character switches, preset-import isolation and downloaded HEXA values.
- Improved cloud conflicts, error handling, request timeouts, history retention and cross-tab updates.
- Fixed translation stability, region restoration, dialog focus and misleading picker and sync messages.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.5.3...v1.6.0)

## [1.5.3] - 2026-09-03

- Reduced passive cloud checks to every five minutes for the selected character, skipped hidden tabs and limited focus checks to once per minute.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.5.2...v1.5.3)

## [1.5.2] - 2026-09-03

- Added a delete dialog that distinguishes the local character from its cloud copy.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.5.1...v1.5.2)

## [1.5.1] - 2026-09-03

- Combined characters into one list with local/cloud chips, row actions and calculated HEXA stats.
- Replaced cloud-directory listing with lookup by IGN and shortened picker wording.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.5.0...v1.5.1)

## [1.5.0] - 2026-09-03

- Added the character picker, local autosave, cloud save/load by IGN, sync status and save history.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.10...v1.5.0)

## [1.4.10] - 2026-08-25

- Excluded untouched preset slots from the old-format import picker.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.9...v1.4.10)

## [1.4.9] - 2026-08-25

- Versioned the userscript’s data URL so Tampermonkey refreshes translation data when the script updates.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.8...v1.4.9)

## [1.4.8] - 2026-08-24

- Added character selection when importing an old multi-character preset file and allowed replacing a specific preset from a file.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.7...v1.4.8)

## [1.4.7] - 2026-08-24

- Imported old-format preset files through the site’s native importer and controls.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.6...v1.4.7)

## [1.4.6] - 2026-08-24

- Removed duplicate extension export/import buttons after the site added its own, retained old-file compatibility and translated the new preset UI.
- Updated GitHub Actions checkout to v7 ([#1](https://github.com/tomerh2001/maplescouter-enhancements/pull/1), contributed by @renovate[bot]).

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.5...v1.4.6)

## [1.4.5] - 2026-08-11

- Refined Core Skills, current-value, cooldown and guide wording.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.4...v1.4.5)

## [1.4.4] - 2026-08-11

- Anchored the patch credit to the logo independently of surrounding layout.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.3...v1.4.4)

## [1.4.3] - 2026-08-11

- Adjusted the patch credit to render as a clean subtitle below the logo.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.2...v1.4.3)

## [1.4.2] - 2026-08-11

- Shortened the logo credit to “Patched by Tomerh2001”.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.1...v1.4.2)

## [1.4.1] - 2026-08-11

- Positioned the patch credit directly below the logo wordmark.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.4.0...v1.4.1)

## [1.4.0] - 2026-08-10

- Fixed a Result-page freeze and corrected result badges, cooldown labels and HEXA icons.
- Updated the page title and made the patch credit a link.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.3.7...v1.4.0)

## [1.3.7] - 2026-08-10

- Added a small patch credit below the site logo.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.3.6...v1.3.7)

## [1.3.6] - 2026-08-10

- Added the Chrome Manifest V3 extension package and corrected the Freud’s Wisdom image label.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.3.5...v1.3.6)

## [1.3.5] - 2026-08-10

- Romanized the site’s demo character names in prose without changing player names.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.3.4...v1.3.5)

## [1.3.4] - 2026-08-10

- Made Soloable and Party-able boss badges consistent.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.3.3...v1.3.4)

## [1.3.3] - 2026-08-10

- Improved translations across split paragraphs, parenthesis variants and phrase fallbacks; refined boss viability badges.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.3.2...v1.3.3)

## [1.3.2] - 2026-08-10

- Kept boss viability badges on one line and added hover explanations.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.3.1...v1.3.2)

## [1.3.1] - 2026-08-10

- Aligned preset buttons with the title and matched their icons and typography to the site.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.3.0...v1.3.1)

## [1.3.0] - 2026-08-10

- Added missing site translations, title variants and parenthesized legend variants.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.2.0...v1.3.0)

## [1.2.0] - 2026-08-10

- Added preset JSON export/import controls and cleaned up the Manual Input header.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.1.1...v1.2.0)

## [1.1.1] - 2026-08-10

- Removed the empty Favorites bar and its reserved space.

[Full diff](https://github.com/tomerh2001/maplescouter-enhancements/compare/v1.1.0...v1.1.1)

## [1.1.0] - 2026-08-10

- Kept informational tooltips visible while hovered and protected character nicknames from translation.
- Translated burst-window shorthand and added the automated GitHub release workflow.

## [1.0.0] - 2026-07-30

- Initial source version of the userscript and build pipeline, with English translation hooks and remembered language/server selections.
- This is the first recorded source version, not a tagged GitHub release.
