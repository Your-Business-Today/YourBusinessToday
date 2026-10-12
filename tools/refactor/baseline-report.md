# Refactor audit — baseline v8, after round 5

Generated 2026-10-12 from refactor/round-5, replacing the v7 baseline adopted from drift at the start of the same round (v6 was the end of round 4, 2026-10-11).

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 91.8% → 91.8%; the standard baseline checks 99.9% → 100%.** **0 of 1,221 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. Every figure a round can move is now at zero: duplication 0.03% → 0 and inline magic values 2 → 0, and the refactoring plan is empty. What holds the score at 91.8% is input validation alone (82 of 118 write doors), which changes behaviour and so is never a round's: it is a `fix/` branch asked for by name (*"Run the input validation check"* shows where).

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 1221 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 1528 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 1859 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 43.55 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 43.55 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1837 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 43.55 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 43.55 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 1528 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 92 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 1859 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1859 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 1528 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 82 in 118 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1221, totalLines: 43548, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 1528, elseBlocks: 0, ifBlocks: 1859, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 44793, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 0 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 88, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1528 |
| designPatterns | roleFamilies: 66, predictedFiles: 92, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 38, components: 309, orphanComponents: 0, averagePageLines: 47 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 94, limitedColumns: 0, writeDoors: 118, unvalidatedDoors: 82, looserLimits: 0 |
| fileAreas | totalFiles: 1625, frontend: 502, backend: 461, shared: 176, api: 135, tooling: 108, tests: 94, database: 81, docs: 55, infrastructure: 13 |

## Round 5 — the area map workspace, the Word styles and four flags

The kit is on 1.19.0 (brought there by #86, which stopped the audit reading text inside strings and markup attributes, so round 4's 30 magic values and 7 member chains fell to 2 and 0 on main before this round began). The gate failed at the start: duplication had grown from 0 to 0.03% with the client prospecting and patches work merged since round 4, so that reading was adopted as v7 and committed as the branch's first commit. The plan then held two steps, both Pass 5, taken in order; a third small sweep cleared the four unprefixed booleans the audit lists outside the score. Behaviour is unchanged: `svelte-check`, 392 tests and the production build are green after every step (the typecheck and build need `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` set; any value will do).

- **Duplication: 0.03% → 0** (step 2 of the plan, taken first because it was the gate's drift). Two clones:
  - **The area map and a patch's page** both drew the same map, company panel and company list with the same selection state, and the same form message with an *Open the client* link. They became `clients/map/AreaMapWorkspace.svelte` (the map pane, panel and list, owning `selectedKey` and the selected pin, which moved out of both pages) and `clients/map/LeadOutcomeNote.svelte` (the form message and the link). The map page passes every pin; the patch page passes its nearest 300, as before.
  - **`prospectFormActions.ts`**: `addLead` and `addLeadWithDirectors` began with the same six lines (staff check, read the seed, validate, add). They now share `addSubmittedProspect`, which returns the refusal or what was added; `isRefusal` narrows it.
- **Inline magic values: 2 → 0** (step 1). `'Normal'` (7 uses) and `'paragraph'` (5) were written into every style in `docx/wordStylesXml.ts`; they are now `normalStyleId`, `paragraphStyleType` and `basedOnNormalXml`. The generated styles XML was compared before and after and is identical.
- **Unprefixed booleans: 4 → 0** (outside the score, a sweep of the CLAUDE.md naming rule): `hadGoal` → `wasGoalLinked`, `latestIsRead` → `isLatestRead`, and the register filters' `includeHubs` / `includeNonTrading` → `shouldIncludeHubs` / `shouldIncludeNonTrading`. The connector's own input names (`includeHubs`, `includeNonTrading`) are unchanged, so no caller sees a difference.
- **Left as it is**: the 17 abbreviation hits are all OOXML element names (`w:pPr`, `w:rPr`, `w:tblPr`) inside the Word builder's XML strings — Word's vocabulary, not identifiers.
- **Held**: files over the limit 0, worst file 0, functions over the limit 0, else blocks 0, orphans 0, missing predicted files 0, tangled conditions 0, literal comparisons 0, comments 0, member chains 0, deeply indented lines 0, overlong function names 0, accessor names 0, input validation looser limits 0 and unvalidated doors 82 of 118 (main's reading; no round sweeps it).
- **Division signature**: files 1,219 → 1,221 and components 307 → 309, the two new components.
- **Put back**: nothing. No step needed a second attempt.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) | v5 (2026-10-10) | v6 (2026-10-11) | v7 (2026-10-12, drift) | v8 (2026-10-12) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | 91.2% | 91.6% | 91.7% | 91.8% | **91.8%** |
| Worst file (lines) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Average page length | 54 | 49 | 48 | 48 | 48 | 48 | 48 | **47** |
| Duplication | 0.42% | 0.19% | 0.26% | 0.26% | 0% | 0% | 0.03% | **0%** |
| Else blocks | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Functions over the limit | 6 | 4 | 4 | 0 | 0 | 0 | 0 | **0** |
| Files over the limit | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Accessor names that want to be a property | — | 32 | 31 | 0 | 0 | 0 | 0 | **0** |
| Long member chain lines | 58 | 201 | 200 | 109 | 11 | 7 | 0 | **0** |
| Deeply indented lines | — | 89 | 81 | 0 | 0 | 0 | 0 | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | 0 | 0 | 0 | 0 | **0** |
| Explanatory comment lines | — | 78 | 78 | 0 | 0 | 0 | 0 | **0** |
| Overlong function names | — | 2 | 2 | 0 | 0 | 0 | 0 | **0** |
| Inline hex colours and styles | — | 5 | 5 | 0 | 0 | 0 | 0 | **0** |
| Inline magic values (repeated literals) | — | — | 30 | 30 | 30 | 30 (66 literals repeated, 699 uses; 67 and 760 at the start) | 2 | **0** |
| Unprefixed booleans | — | — | — | — | — | — | 4 | **0** |

## Worst files by length

All 1,221 files are within the limit.

## Next round, named

The new `tools/refactor/refactor-plan.md` is empty: every figure a round can move is at zero, and every file is within the limit, so there is no worst file. The next round holds the gate against whatever main adds. The score's remaining 8.2 points are input validation, which a `fix/` branch moves.
