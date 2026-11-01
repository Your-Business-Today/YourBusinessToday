# Refactor audit — baseline v20, after round 15

Generated 2026-10-31 from refactor/round-15, replacing the v19 baseline committed at the end of round 14.

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 100% → 100%.** **0 of 2,099 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. The round started from a green gate, with jscpd installed so that duplication was measured, and the plan it was handed had no steps: every figure the score counts was already at zero on `staging`, including the eleven merges since v19 (the deployment history page, the Infrastructure department, the long-term backlog panel and the clickable task references). The round's one job was to hold the gate against that work and retake the baseline on it.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 2099 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 2832 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 3068 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 73.42 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 73.42 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 3269 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 73.42 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 73.42 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 2832 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 103 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 3068 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 3068 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 2832 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 165 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 2099, totalLines: 73422, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 2832, elseBlocks: 0, ifBlocks: 3068, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 74892, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 35, unprefixedBooleans: 1 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 156, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 2832 |
| designPatterns | roleFamilies: 116, predictedFiles: 103, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 47, components: 437, orphanComponents: 0, averagePageLines: 45 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 118, limitedColumns: 0, writeDoors: 165, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 2610, backend: 800, frontend: 660, shared: 335, tests: 242, api: 225, database: 140, tooling: 130, docs: 62, infrastructure: 16 |

## Round 15 — nothing to take, the gate held

The plan at the start was empty: *Nothing to do: every figure is at zero.* The full reading on `staging` (2,099 source files, 73,422 lines, 2,832 functions, 165 write doors) found no file or function over its limit, no `else`, no clone, no comment, no magic value, no orphan, no member chain, no tangled or literal condition, no accessor that wants to be a property, no predicted file missing and no door writing unchecked. The gate passed against v19 before anything was touched, so there was no drift to adopt and no step to take.

- **No step worked**: no source file changed. The round is the baseline it retook, and the README's score box, which now counts the files merged since v19.
- **Held**: every standard, prose, design pattern and input validation figure at zero. The eleven merges since v19 added 18 source files, 31 functions, 2 predicted files (both present) and one write door (checked), and none of them moved a ratcheted figure.
- **Division signature**: none. No file was divided.
- **Left as found**: the 35 abbreviation hits are, as in rounds 13 and 14, names that are not ours (vitest's `vi.fn()` and OOXML's `w:val`), and the one unprefixed boolean is `changesDataStructure`, a published connector input. Neither is scored.
- **Not measured**: widget adoption, because `siteDefinition.catalogue` in `rules.json` is empty, and entities outside their expected file count, because the entity globs match no family of four or more. Both lend their weight to the rest, and neither is a round's to set up: the catalogue comes from *"Run the widget identification"* and the designs from `widget-design`.
- **Checks**: the fast and the full audit both read 100.0%, and the gate passed against v19 and against the new v20.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) | v5 (2026-10-10) | v6 (2026-10-11) | v7 (2026-10-12, drift) | v8 (2026-10-12) | v9 (2026-10-13, drift) | v10 (2026-10-13) | v11 (2026-10-17, drift) | v12 (2026-10-17) | v13 (2026-10-17) | v14 (2026-10-18, drift) | v15 (2026-10-18) | v16 (2026-10-18) | v17 (2026-10-20) | v18 (2026-10-28) | v19 (2026-10-31) | v20 (2026-10-31) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | 91.2% | 91.6% | 91.7% | 91.8% | **91.8%** | 91.8% | **91.8%** | 91.8% | **91.8%** | **91.8%** | 96.8% | **96.8%** | **100%** | **100%** | **100%** | **100%** | **100%** |
| Worst file (lines) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Average page length | 54 | 49 | 48 | 48 | 48 | 48 | 48 | **47** | 47 | **47** | 47 | **47** | **47** | 46 | **46** | **46** | **45** | 46 | 45 | 45 |
| Duplication | 0.42% | 0.19% | 0.26% | 0.26% | 0% | 0% | 0.03% | **0%** | 0.04% | **0%** | 0.02% | **0%** | **0%** | 0.04% | **0%** | **0%** | **0%** | **0%** | **0%** (0.02% at the start) | **0%** |
| Else blocks | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Functions over the limit | 6 | 4 | 4 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Files over the limit | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Accessor names that want to be a property | — | 32 | 31 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Long member chain lines | 58 | 201 | 200 | 109 | 11 | 7 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Deeply indented lines | — | 89 | 81 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Explanatory comment lines | — | 78 | 78 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Overlong function names | — | 2 | 2 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Inline hex colours and styles | — | 5 | 5 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Inline magic values (repeated literals) | — | — | 30 | 30 | 30 | 30 (66 literals repeated, 699 uses; 67 and 760 at the start) | 2 | **0** | 2 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| Unprefixed booleans | — | — | — | — | — | — | 4 | **0** | 0 | **0** | 0 | **0** | **0** | 8 | 8 | 8 | **1** | **1** | **1** | **1** |
| Unchecked write doors | — | — | — | — | — | — | — | — | — | — | — | — | 75 of 142 | 31 of 157 | 31 of 157 | **0 of 142** | **0 of 149** | **0 of 157** | **0 of 164** | **0 of 165** |

No round committed a baseline between v18 and v19; the kit 1.37.0 roll retook it by bootstrap without jscpd, so v19 compares against v18. v20 was taken with jscpd installed.

## Worst files by length

All 2,099 files are within the limit.

## Next round, named

The new `tools/refactor/refactor-plan.md` is empty again: every figure the score counts is at zero, and there is no worst file. The next round holds the gate against whatever `staging` adds and installs jscpd before its first audit so that duplication is measured. The elements that would give a round work to do are the two not yet measured: a widget catalogue in `rules.json` would make widget adoption count, and that is the widget identification's to write, not a round's.
