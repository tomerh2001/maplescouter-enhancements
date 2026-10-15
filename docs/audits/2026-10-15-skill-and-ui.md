# Skill images, dynamic translations and UI audit — 2026-10-15

Version: 1.7.13.

## Changes

- Replaced explicitly unreleased skill images with a dashed placeholder and a clear accessible label. This covers empty input image URLs, question-mark mastery placeholders, and separately constructed result-popup image paths. It does not change skill levels, handlers, shared skill metadata, or calculations.
- The affected visible slots are the third skill core for Hayato, Mo Xuan, Lynn, Kanna, Sia Astelle and Erel Light, plus Sia/Erel mastery cores 3 and 4. The current site still marks these entries as unreleased; no skill artwork or effects were invented.
- Translated the shortened Cadena tooltip names Grand Arsenal, Torrent and Maelstrom. The earlier scan checked full catalog names and missed the shortened card labels.
- Translated the complete HEXA reset-refund summary, preserving every number. Added dynamic EXP quantities, durations, current-level percentages, draw-pool counts, Dojo floors/resistance notes, ranking dates, farming instructions, donation and useful-link labels. New boss-reward sentence fragments are scoped to their card so Korean particles are not replaced globally.
- Wrapped Training Grounds ranking filters and challenge action buttons. The Dojo's flex-based table now scrolls inside its card on phones.
- The route crawler now includes underscores, adding the two previously skipped challenge routes. Added a reproducible asset audit covering both catalog URLs and the independent result-card URL scheme.

## Class and image checks

All **54 classes** were selected through the native input selector in the supported Chromium browser. Every displayed skill-card title was English and every skill card had a nonempty image source after translation settled. [Class coverage](2026-10-15-skill-and-ui/class-coverage.json).

The asset audit checked **649 distinct URLs** from the current class catalog and result path scheme. There were **eight missing result images**, all explicitly unreleased; the new placeholder covers them. Four released images initially returned transient HTML responses; bounded direct retries returned valid PNGs. No released-skill image remained unavailable. The audit also records **222 empty catalog URLs**, including future slots that are not currently displayed. [Asset coverage](2026-10-15-skill-and-ui/asset-coverage.json).

Native calculations and result popups were exercised for **all six affected GMS classes**. Each popup had zero broken skill images. Sia and Erel showed Tree of Stars, not Freud. Sia's manual HEXA planner also showed Tree of Stars. Freud's Wisdom appeared only for the six Hero classes in the all-class input check: Luminous, Mercedes, Aran, Evan, Shade and Phantom. The reported Sia/Freud mix-up was not reproducible in the current site build; this release does not claim to have found its historical cause. [Result coverage](2026-10-15-skill-and-ui/result-coverage.json).

[Sia input](2026-10-15-skill-and-ui/sia-input.png) · [HEXA refund](2026-10-15-skill-and-ui/hexa-refund.png)

## Route and interaction checks

- Crawled **70 public routes / 195 active chunks**, with no fetch or parse failures. All 70 routes were visited in the browser, checked at desktop and 390px widths, and their initial desktop screenshots reviewed. [Route coverage](2026-10-15-skill-and-ui/route-coverage.json).
- Screenshots and width checks are an initial-state sweep, not exhaustive coverage of every modal, scroll position, or account-dependent state. Some pages remain at loading/empty states without a character or login; My Page was checked signed out. Reward-card fragment behavior has focused regression coverage, not a signed-in My Page end-to-end test.
- Rechecked affected pages after changes. Settled desktop ranking filters stay inside their 968px container. The phone Dojo is 390px wide with a 326px local scroll area containing the 620px table. The challenge page settles at 390px. A transient flame-simulator overflow also settled at 390px without a new change.
- Sia calculation → HEXA Efficiency → After Reset → reset-refund toggle displays `Before the first X: Energy 143 / 145 · Fragments 3,583 / 4,400`. Tests cover the screenshot's exact totals too. Input levels still update the calculation, and class changes restore real icons and labels.
- Player names, credits and user-authored messages remain untranslated. Long-form site update history, guide prose and legal documents still contain Korean; this audit does **not** claim that the entire site's content is now English. The bundle scan cannot find all server-rendered or API-provided prose. Six remaining static scan entries are the five scoped reward fragments and the existing `N기` season token translated after interpolation.
- Used isolated localhost:8801 test state. No real character saves or cloud writes were changed. Gecko runtime was not exercised this turn; Firefox package validation was run.

[Ranking filters](2026-10-15-skill-and-ui/ranking-filters.png) · [Dojo phone layout](2026-10-15-skill-and-ui/dojo-phone.png)

## Validation

- 171 tests passed, including numeric preservation, scoped reward fragments, placeholder idempotence, unrelated image preservation, changing class after a placeholder, and preserving ASCII player names that match dictionary entries.
- Userscript syntax and `git diff --check` passed.
- Both 1.7.13 packages built. Firefox lint: 0 errors, 0 notices, 11 existing warnings.

## References

- [Sia Astelle skills](https://maplestorywiki.net/w/Sia_Astelle/Skills), [Erel Light skills](https://maplestorywiki.net/w/Erel_Light/Skills), and [SHINE Tree of Stars](https://maplestorywiki.net/w/SHINE_Tree_of_Stars): class-specific skill identity and current unavailable slots.
- [Cadena skills](https://maplestorywiki.net/w/Cadena/Skills): Grand Arsenal and Maelstrom. Torrent remains the existing provisional translation for newer KMS content.
- Current live shared catalog: `6352-0a4a27344bc2986a.js`, checked against actual input and result rendering.

## Store submissions

[Release v1.7.13](https://github.com/tomerh2001/maplescouter-enhancements/releases/tag/v1.7.13), source commit `6a11cb6`. [Release workflow 38684846051](https://github.com/tomerh2001/maplescouter-enhancements/actions/runs/38684846051) passed all jobs.

- Chrome: 1.7.13 accepted, `PENDING_REVIEW`, `DEFAULT_PUBLISH`.
- Firefox: 1.7.13 accepted, `PENDING_REVIEW`, listed channel, version ID `6579624`, source archive attached.

Automatic publication after approval remains enabled. No older-pending replacement was needed. Receipts are retained in the workflow artifacts and locally in `/tmp/maplescouter-1.7.13-receipts`.
