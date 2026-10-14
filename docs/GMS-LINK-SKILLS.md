# GMS Link Skill suggestions

Version 1.7.7 adds GMS candidates to **Result > Links/Potentials > Link Skill Eff** in English. Both manual and API character results are supported. The character's calculation region decides whether to show the additions, so changing the header region does not relabel an old KMS result as GMS.

## What changed

- Hayato: Moonlit Blade Learnings.
- Kanna: Elementalism.
- Lynn: Focus Spirit (Spirit Guide Blessing when owned by Lynn).
- Mo Xuan: Qi Cultivation. This also corrects the old English label, Grounded Body.
- A note about Erel's Guiding Stars. Its buff-duration effect cannot be ranked using the site's published efficiency coefficients, so it is not given a misleading numerical rank.
- Lethe's Covenant is removed from GMS suggestions, matching the site's own optimizer region filter.
- Erel's Korean class name is translated as Erel Light.

The bossing optimizer already includes the four GMS candidates. This release changes the separate efficiency table, not that optimizer or the server's damage calculations.

## Effects and assumptions

| Link | Lv. 2 | Lv. 3 | Condition |
|---|---|---|---|
| Moonlit Blade Learnings | 5% critical damage | 7% critical damage | At least 100% critical rate and 50% critical damage in the supplied inputs |
| Elementalism | 15% damage | 20% damage | 12-second effect after 40 attack-skill uses |
| Focus Spirit | 7% boss damage, 7% critical rate, 4% Max HP/MP | 11% boss damage, 10% critical rate, 5% Max HP/MP | Passive |
| Qi Cultivation | 4% boss damage plus 2% per stack | 6% boss damage plus 3% per stack | Up to six stacks from boss attacks, once every two seconds; five-second duration |

Normal mode compares Lv. 2, matching the native table. The existing Lv. 2 to 3 checkbox compares the additional effect. A character's own link is not suggested as another transferred link. Known equipped Lv. 3 links are not suggested for another upgrade.

Version 1.7.9 adds **Max level**, a separate full-bonus comparison. It uses each GMS cap: individual Lv. 3, Explorer Lv. 9, Cygnus Lv. 15, and Zero Lv. 6. It and **Lv 2→3** are mutually exclusive. Both unchecked keeps the existing table. The mode affects this list only, without changing character inputs, cloud saves or the site's result.

The max-level catalog covers all 26 damage candidates, including candidates below the native table's top-15 cutoff. It uses transferred effects, not the extra owner-only bonuses introduced in v269. Current GMS values include Empirical Knowledge's 12% Damage/IED at full stacks and Rhinne's Blessing's updated 15% IED. Survival and EXP links have no damage ranking; Guiding Stars retains its existing unranked note because buff duration is not modeled.

The native timing assumptions for Terms and Conditions, Thief's Cunning and Time to Prepare are retained by scaling their existing Lv. 2 effective bonuses by the GMS max/base effect ratio. This changes level, not assumed uptime. Noble Fire retains the native solo-party assumption. All other existing class-specific limits still apply. Equipped links are removed from the comparison baseline before scoring the full maximum bonus; IED removal respects multiplicative stacking and the 300/380 selection. Estimates still use local efficiency coefficients, not a new server calculation.

Since 1.7.8, Kanna always uses its active window and Mo Xuan always uses full stacks. The extra toggle and summary note have been removed. This is a comparison of those states, not a prediction of average encounter damage or a recommended set of twelve links.

The estimates use the site's `specEfficiency` coefficients and rounding. Lynn's HP is valued only for Demon Avenger; critical rate follows the native table's Vicious Shot convention. Extra critical rate below the cap on other classes, buff duration, MP, survival, utility and actual buff uptime are not modeled. Manual results have no equipped-link list, just as in the native table. Outside Max level mode, the native KMS candidates keep their original scores.

Guiding Stars is shown as a consideration using Nexon's confirmed individual Lv. 3 effect: 3% critical damage and 10% buff duration. This release does not assume a combined SHINE level cap or calculate a buff-duration score.

## Sources checked on October 14, 2026

- [Nexon: Sengoku Warrior Revamp](https://steamcommunity.com/games/216150/announcements/detail/506226983746666503). Confirms Hayato's new conditional critical-damage effect and Kanna's activation and duration. The announcement says "Moonlight"; the existing game-data translation uses "Moonlit".
- [Nexon v264, Link Skill Changes](https://www.nexon.com/maplestory/news/update/32522/v-264-every-little-thing-every-precious-thing-patch-notes#LinkSkillChanges). Confirms Mo Xuan's Lv. 3 effect.
- [Nexon v269, Link Skill Changes](https://www.nexon.com/maplestory/news/update/41138/v-269-ride-the-lightning-patch-notes#LinkSkillChanges). Confirms Lynn's updated Lv. 3 boss damage.
- [Nexon: Now Available, Erel Light](https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1835871199301580). Confirms Guiding Stars' individual Lv. 3 effect.
- MapleScouter's live optimizer catalog, `2231-65cf7a0fd7ec8470.js`, and optimizer `page-4b8e6b1201ba383b.js`: corroborate the four Lv. 2 effects, class ownership, icons, and region restrictions. The live result module `page-5f749a7abac64fbf.js` contains the separate KMS-only table.

The broader GMS inspection also found existing GMS class entries, including Sia and Erel, HEXA assets and familiar passive-skill support in the input/result calculations. Those were retained. Equipment acquisition, familiar simulation and class damage models require upstream data/calculation support; this release does not invent those features or claim a complete GMS simulator.

## Implementation and fallback

The original React list stays mounted. A separate DOM list combines its visible candidates with our calculated additions, preserving the native inputs and scores. It refreshes after table changes and result updates. On non-GMS results, other languages, missing data, or an unrecognized table structure, the original list is restored. No character data or calculation response is modified, and the feature makes no additional API calls. Icons use the site's existing asset URLs.
