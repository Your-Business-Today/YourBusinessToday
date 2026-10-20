# Refactor audit — baseline v17, after round 11

Generated 2026-10-20 from claude/project-thread-efu0yl, replacing the v16 baseline committed at the end of round 10.

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 100% → 100%.** **0 of 1,954 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. The round started from a green gate and an empty plan: the fifteen commits since round 10 (backlog counts, the YBT summary prompt, the prospect demo and its two kinds of business) added 93 source files and 7 write doors, all within the limits, every door checked. The round held the gate and made three booleans into questions.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 1954 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 2583 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 2865 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 68.3 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 68.3 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 3014 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 68.3 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 68.3 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 2583 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 108 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 2865 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 2865 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 2583 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 149 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1954, totalLines: 68304, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 2583, elseBlocks: 0, ifBlocks: 2865, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 69822, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 28, unprefixedBooleans: 1 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 154, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 2583 |
| designPatterns | roleFamilies: 108, predictedFiles: 108, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 50, components: 431, orphanComponents: 0, averagePageLines: 45 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 115, limitedColumns: 0, writeDoors: 149, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 2427, backend: 754, frontend: 648, shared: 304, tests: 202, api: 199, database: 127, tooling: 120, docs: 59, infrastructure: 14 |

## Round 11 — holding the gate

The plan was empty at the start of the round: every figure the score counts was at zero, input validation included. A round takes its steps from the plan, so there was no refactoring step to take. The round re-measured, held the gate against what main had added, and fixed the one rule the audit reports but does not score that a round can fix without changing a published name.

- **Three booleans become questions**: `goalSetting` → `isGoalAutocomplete` (the autocomplete helpers, the build queue, the autocomplete register and the task's autocomplete fact and modal), `autocompleteOn` → `isReviewAutocomplete` (`raiseReviewTask.ts`), `promiseIsNotAutocomplete` → `isPromiseAutocomplete` (`promiseField.ts`). Renames only; unprefixed booleans 9 → 1.
- **Left as found**: `changesDataStructure` is the `record_complexity` input field the connector publishes, so renaming it would break every Claude that calls it. The 28 abbreviation hits are names that are not ours: vitest's `vi.fn()` in test mocks and OOXML's `w:val`, `w:pPr`, `w:rPr` in the Word document writer.
- **Held**: every standard figure at zero, duplication 0%, unchecked write doors 0 of 149, `looserLimits` 0.
- **Division signature**: none. Source files 1,861 → 1,954 and pattern predictions 104 → 108 grew with the features main added since round 10, not with any split.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) | v5 (2026-10-10) | v6 (2026-10-11) | v7 (2026-10-12, drift) | v8 (2026-10-12) | v9 (2026-10-13, drift) | v10 (2026-10-13) | v11 (2026-10-17, drift) | v12 (2026-10-17) | v13 (2026-10-17) | v14 (2026-10-18, drift) | v15 (2026-10-18) | v16 (2026-10-18) | v17 (2026-10-20) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | 91.2% | 91.6% | 91.7% | 91.8% | **91.8%** | 91.8% | **91.8%** | 91.8% | **91.8%** | **91.8%** | 96.8% | **96.8%** | **100%** | **100%** |
| Worst file (lines) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Average page length | 54 | 49 | 48 | 48 | 48 | 48 | 48 | **47** | 47 | **47** | 47 | **47** | **47** | 46 | **46** | **46** | **45** |
| Duplication | 0.42% | 0.19% | 0.26% | 0.26% | 0% | 0% | 0.03% | **0%** | 0.04% | **0%** | 0.02% | **0%** | **0%** | 0.04% | **0%** | **0%** | **0%** |
| Else blocks | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Functions over the limit | 6 | 4 | 4 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Files over the limit | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Accessor names that want to be a property | — | 32 | 31 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Long member chain lines | 58 | 201 | 200 | 109 | 11 | 7 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Deeply indented lines | — | 89 | 81 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Explanatory comment lines | — | 78 | 78 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Overlong function names | — | 2 | 2 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Inline hex colours and styles | — | 5 | 5 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Inline magic values (repeated literals) | — | — | 30 | 30 | 30 | 30 (66 literals repeated, 699 uses; 67 and 760 at the start) | 2 | **0** | 2 | **0** | 0 | **0** | **0** | 0 | **0** | **0** | **0** |
| Unprefixed booleans | — | — | — | — | — | — | 4 | **0** | 0 | **0** | 0 | **0** | **0** | 8 | 8 | 8 | **1** |
| Unchecked write doors | — | — | — | — | — | — | — | — | — | — | — | — | 75 of 142 | 31 of 157 | 31 of 157 | **0 of 142** | **0 of 149** |

## Worst files by length

All 1,954 files are within the limit.

## Next round, named

The new `tools/refactor/refactor-plan.md` is empty: every figure the score counts is at zero, and there is no worst file. The next round holds the gate against whatever main adds, closing any new door the same way.
