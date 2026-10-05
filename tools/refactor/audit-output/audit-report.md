# Refactor audit

Generated 2026-10-05 19:05 UTC.

## Headline

**Code quality score 84.1%.** **0 of 972 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **95.4%** | **60** | |
| Files over the line limit | 0 in 972 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 6 in 1171 functions | 98.0% | 8 | 25% of functions |
| Else blocks | 1 in 1494 branches | 99.9% | 5 | 50% of branches |
| Duplication % | 0.42 | 97.9% | 8 | 20 |
| Explanatory comment lines | 90 in 34.64 thousand lines | 94.8% | 4 | 50 per thousand lines |
| Inline magic values | 36 in 34.64 thousand lines | 94.8% | 4 | 20 per thousand lines |
| Orphan components and functions | 29 in 1403 components and functions | 79.3% | 4 | 10% of components and functions |
| Long member chain lines | 205 in 34.64 thousand lines | 80.3% | 4 | 30 per thousand lines |
| Deeply indented lines | 88 in 34.64 thousand lines | 91.5% | 4 | 30 per thousand lines |
| Overlong function names | 2 in 1171 functions | 98.3% | 4 | 10% of functions |
| **Design pattern file count** | | **91.5%** | **10** | |
| Files the patterns predict but are missing | 2 in 47 predicted files | 91.5% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **80.3%** | **20** | |
| Conditions with calls tangled inside calls | 25 in 1494 branches | 93.3% | 8 | 25% of branches |
| Conditions compared to a raw literal | 110 in 1494 branches | 70.5% | 6 | 25% of branches |
| Accessor names that want to be a property | 32 in 1171 functions | 72.7% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 94 in 94 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 407 | 285 | 11,211 |
| backend | 395 | 392 | 12,025 |
| shared | 136 | 135 | 4,653 |
| api | 104 | 104 | 4,829 |
| tooling | 102 | 0 | 0 |
| database | 69 | 0 | 0 |
| tests | 56 | 56 | 1,925 |
| docs | 48 | 0 | 0 |
| infrastructure | 13 | 0 | 0 |
| **whole repository** | **1,330** | **972** | **34,643** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 972, totalLines: 34643, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 6, totalFunctions: 1171, elseBlocks: 1, ifBlocks: 1494, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 2, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 32, measurementIsHeuristic: True |
| duplication | clones: 8, duplicatedLines: 106, totalLines: 25007, duplicatedPercentage: 0.42, carriedFromBaseline: True |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 90, filesWithComments: 39, taskMarkers: 0 |
| magicValues | inlineHexColours: 4, inlineStyleAttributes: 2, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 205, deeplyIndentedLines: 88, overlongLines: 79, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 25, literalComparisonLines: 110, measurementIsHeuristic: True |
| orphans | orphanFunctions: 26, functionsExamined: 1171 |
| designPatterns | roleFamilies: 54, predictedFiles: 47, predictedFilesMissing: 2, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 31, components: 232, orphanComponents: 3, averagePageLines: 49 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 84, limitedColumns: 0, writeDoors: 94, unvalidatedDoors: 94, looserLimits: 0 |
| fileAreas | totalFiles: 1330, frontend: 407, backend: 395, shared: 136, api: 104, tooling: 102, database: 69, tests: 56, docs: 48, infrastructure: 13 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | not measured | 84.1% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 6 | 6 | held |
| functionShape.elseBlocks | 1 | 1 | held |
| duplication.duplicatedPercentage | 0.42 | 0.42 | held |
| comments.explanatoryCommentLines | 90 | 90 | held |
| magicValues.inlineHexColours | 4 | 4 | held |
| inventory.orphanComponents | 3 | 3 | held |
| orphans.orphanFunctions | None | 26 | — |
| prose.longMemberChainLines | 208 | 205 | better |
| prose.deeplyIndentedLines | 113 | 88 | better |
| functionNames.overlongFunctionNames | 2 | 2 | held |
| accessorNames.gluedAccessorNames | None | 32 | — |
| conditions.tangledConditionLines | None | 25 | — |
| conditions.literalComparisonLines | None | 110 | — |
| designPatterns.predictedFilesMissing | None | 2 | — |
| siteDefinition.handRolledElements | None | None | — |
| siteDefinition.boxedContentWidgets | None | None | — |
| inputValidation.unvalidatedDoors | None | 94 | — |
| inputValidation.looserLimits | None | 0 | — |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
