# Refactor audit — baseline after round 16

Generated 2026-11-03 from claude/project-thread-75lo25, replacing the baseline of 2026-11-01.

## Headline

Code quality score 99.9% → 100.0%. **Code quality score 100.0%.** **0 of 2,113 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

The designs: no design index (`docs/design/widgets.json`) is set up, so the site has never been checked against a brand or the widgets against design sheets. *"Set up the widget designs"*, then *"Check the site against the brand"* and *"Check the widgets against their designs"* (`widget-design`) run them; a round does not.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 2113 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 2850 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 3089 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 73.88 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 73.88 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 3288 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 73.88 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 73.88 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 2850 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 103 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 3089 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 3089 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 2850 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 166 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 2113, totalLines: 73876, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 2850, elseBlocks: 0, ifBlocks: 3089, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 75354, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 35, unprefixedBooleans: 1 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 156, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 2850 |
| designPatterns | roleFamilies: 117, predictedFiles: 103, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 47, components: 438, orphanComponents: 0, averagePageLines: 45 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 118, limitedColumns: 0, writeDoors: 166, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 2615, backend: 805, frontend: 661, shared: 337, tests: 246, api: 228, database: 144, tooling: 116, docs: 62, infrastructure: 16 |

## Round 16 — the day reader gets one home

Sixteen commits had reached main since the last baseline, so the round was due. The gate passed at the start, and the plan held two steps, both about the same eight lines: the function that reads a day someone sent (a real day written YYYY-MM-DD, nothing, or not a day) was written word for word in the continuity copy's validator and the to-do validator. It now lives once in the days module, beside `dayOf` and `daysAgo`.

- **Give `readDay / readDueDate` one home**: `src/lib/data/continuityCopy.ts` and `src/lib/data/validateTodo.ts` each lose their copy and the ISO day pattern behind it; `src/lib/data/days.ts` gains `readDay`, and both validators import it. The body moved verbatim, so what each door accepts and refuses is unchanged. Every caller was in those two files.
- **Duplication % 0.01 to zero**: the one clone pair was that function, so duplication is now 0.
- **Held**: every ratcheted figure, at zero: files and functions over the limit, else blocks, comments, magic values, orphans, member chains, deep indentation, overlong and accessor names, tangled and literal conditions, predicted files missing, and the input validation doors.
- **Division signature**: none.

## The journey so far

| Figure | 2026-11-01 | after round 16 |
| --- | --- | --- |
| Code quality score | 99.9% | **100.0%** |
| Worst file | 0 lines | **0 lines** |
| Duplication % | 0.01 | **0** |
| Else blocks | 0 | **0** |
| Functions over the limit | 0 | **0** |
| Files over the limit | 0 | **0** |

## Worst files by length

All files are within the limit.

## Next round, named

The plan is empty: every figure is at zero. The next round starts by measuring what the next ten merges add.
