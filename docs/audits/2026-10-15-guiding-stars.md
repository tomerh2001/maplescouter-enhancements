# Guiding Stars and Link Skill controls, 2026-10-15

Version: 1.7.10.

## Changes

- Removed the bottom Guiding Stars paragraph and the redundant Link Skill Eff heading.
- Moved Max level to the left of Lv 2→3 and 380. The three controls share one row on desktop and phone.
- Added Guiding Stars (Sia Astelle / Erel Light) to the sorted list with its game icon. The base comparison combines two Lv. 2 characters (shared Lv. 4), upgrade mode compares shared Lv. 4→6, and Max level uses Lv. 6.
- The row tooltip gives critical damage and buff duration for the selected mode. Only critical damage enters the score: the site's response has no buff-duration efficiency coefficient. Existing own-link exclusions remain, including Sia/Erel. No character calculation, preset or cloud save is modified.
- Embedded the 32px game icon, avoiding another remote image host at runtime.

## Evidence and limits

[Nexon's v269 patch notes](https://www.nexon.com/maplestory/news/update/41138/v-269-ride-the-lightning-patch-notes) confirm Erel's individual Lv. 3 bonus (3% Critical Damage, 10% Buff Duration). The [GMS v270 skill table](https://maplestorywiki.net/w/Guiding_Stars), viewed in the browser, confirms the shared cap of 6: Critical Damage 1/2/3/4/5/6%, Buff Duration 4/7/10/13/16/19%. The [game icon](https://media.maplestorywiki.net/yetidb/Skill_Guiding_Stars.png) is © Nexon.

This remains an efficiency comparison, not a full buff-uptime simulation or optimizer change. Buff duration can change a class's actual benefit; the tooltip states its omission rather than presenting a fabricated coefficient.

## Validation

- 163 Node tests passed. New cases cover shared base/upgrade/max levels, equipped levels 0–6, invalid levels and coefficients, own-link exclusions, and the explicit buff-duration limitation.
- Userscript syntax and whitespace checks passed; both 1.7.10 packages built.
- Firefox lint: 0 errors, 11 existing warnings. Gecko runtime was not rechecked for this change.
- Supported browser, isolated localhost:8800 origin, native default Mercedes result fixture from the preceding validation. No real character saves or cloud writes were used.
- Guiding Stars: base 1.063%, upgrade 0.531%, max 1.594%, with a loaded 32px icon. Max level and Lv 2→3 remained mutually exclusive.
- Switching to Armor Bonus Potential removed the injected controls and heading marker; switching back mounted exactly one Max level checkbox and retained its state.
- Desktop header: 284px client/scroll width. At a 390px viewport: 326px header client/scroll width, all three controls share the same vertical position, page width 390px.
- The serialized native result remained identical after all interactions.
- [Desktop preview](2026-10-15-guiding-stars/desktop.png).

## Store submissions

[Release v1.7.10](https://github.com/tomerh2001/maplescouter-enhancements/releases/tag/v1.7.10), source commit `14668a1`. [Release workflow 38663357177](https://github.com/tomerh2001/maplescouter-enhancements/actions/runs/38663357177) passed all jobs, including reproducible package verification.

- Chrome: 1.7.10 accepted, `PENDING_REVIEW`, `DEFAULT_PUBLISH`.
- Firefox: 1.7.10 accepted, `PENDING_REVIEW`, listed channel, version ID `6579171`, source archive attached.

Both submissions request automatic publication after approval. No older-pending replacement was needed. Receipts are retained in the workflow artifacts.
