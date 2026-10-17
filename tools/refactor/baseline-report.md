# Refactor audit — baseline v13, after round 8

Generated 2026-10-17 from claude/refactor-round-8-1uyvmt, replacing the v12 baseline committed at the end of round 7 earlier the same day.

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 91.8% → 91.8%; the standard baseline checks 100% → 100%.** **0 of 1,741 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. The gate passed at the start and the refactoring plan held no steps, so the round changed no source: it re-baselines after the task cards merge (PR #129), which added seven files and held every figure. What holds the score at 91.8% is input validation alone (75 of 142 write doors), which changes behaviour and so is never a round's.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 1741 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 2285 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 2627 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 61.1 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 61.1 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 2686 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 61.1 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 61.1 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 2285 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 104 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 2627 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 2627 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 2285 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 75 in 142 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1741, totalLines: 61101, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 2285, elseBlocks: 0, ifBlocks: 2627, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 62669, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 27, unprefixedBooleans: 0 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 152, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 2285 |
| designPatterns | roleFamilies: 91, predictedFiles: 104, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 48, components: 401, orphanComponents: 0, averagePageLines: 47 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 109, limitedColumns: 0, writeDoors: 142, unvalidatedDoors: 75, looserLimits: 0 |
| fileAreas | totalFiles: 2192, backend: 695, frontend: 616, shared: 258, api: 165, tests: 157, tooling: 117, database: 113, docs: 57, infrastructure: 14 |

## Round 8 — nothing to sweep

Asked for by name two merges after round 7, before the deploy count made it due. The gate passed against v12 with no drift, and `python3 -m tools.refactor.audit.plan .` wrote a plan with no steps: every figure a round can move was already at zero, including after the task cards merge (PR #129). The kit on the branch (1.19.0) is the kit's latest, so there was no newer reading to take. The round therefore takes no step and changes no source; its one commit is this baseline.

- **No step taken**: the plan's order was empty at the start.
- **Held**: files over the limit 0, worst file 0, functions over the limit 0, else blocks 0, orphans 0, missing predicted files 0, tangled conditions 0, literal comparisons 0, comments 0, member chains 0, deeply indented lines 0, overlong function names 0, accessor names 0, unprefixed booleans 0, magic values 0, duplication 0, input validation looser limits 0 and unvalidated doors 75 of 142 (no round sweeps it).
- **Left as it is**: the abbreviation hits stay at 27 (`vi.fn()` and the Word builder's OOXML element names, as round 7 found) and overlong lines at 152; neither is scored or ratcheted.
- **Division signature**: none. Source files 1,734 → 1,741 and components 394 → 401 come from the task cards merge, not from the round.
- **Put back**: nothing.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) | v5 (2026-10-10) | v6 (2026-10-11) | v7 (2026-10-12, drift) | v8 (2026-10-12) | v9 (2026-10-13, drift) | v10 (2026-10-13) | v11 (2026-10-17, drift) | v12 (2026-10-17) | v13 (2026-10-17) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | 91.2% | 91.6% | 91.7% | 91.8% | **91.8%** | 91.8% | **91.8%** | 91.8% | **91.8%** | **91.8%** |
| Worst file (lines) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Average page length | 54 | 49 | 48 | 48 | 48 | 48 | 48 | **47** | 47 | **47** | 47 | **47** | **47** |
| Duplication | 0.42% | 0.19% | 0.26% | 0.26% | 0% | 0% | 0.03% | **0%** | 0.04% | **0%** | 0.02% | **0%** | **0%** |
| Else blocks | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Functions over the limit | 6 | 4 | 4 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Files over the limit | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Accessor names that want to be a property | — | 32 | 31 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Long member chain lines | 58 | 201 | 200 | 109 | 11 | 7 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Deeply indented lines | — | 89 | 81 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Explanatory comment lines | — | 78 | 78 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Overlong function names | — | 2 | 2 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Inline hex colours and styles | — | 5 | 5 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** |
| Inline magic values (repeated literals) | — | — | 30 | 30 | 30 | 30 (66 literals repeated, 699 uses; 67 and 760 at the start) | 2 | **0** | 2 | **0** | 0 | **0** | **0** |
| Unprefixed booleans | — | — | — | — | — | — | 4 | **0** | 0 | **0** | 0 | **0** | **0** |

## Worst files by length

All 1,741 files are within the limit.

## Next round, named

The new `tools/refactor/refactor-plan.md` is empty: every figure a round can move is at zero, and there is no worst file. The next round holds the gate against whatever main adds. The score's remaining 8.2 points are input validation, which a `fix/` branch moves (*"Run the input validation check"* shows where).
