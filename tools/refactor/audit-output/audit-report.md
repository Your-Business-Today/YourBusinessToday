# Refactor audit

Generated 2026-10-06 13:11 UTC.

## Headline

**Code quality score 87.7%.** **0 of 946 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **97.0%** | **60** | |
| Files over the line limit | 0 in 946 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 4 in 1122 functions | 98.6% | 8 | 25% of functions |
| Else blocks | 0 in 1463 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.19 | 99.1% | 8 | 20 |
| Explanatory comment lines | 78 in 33.42 thousand lines | 95.3% | 4 | 50 per thousand lines |
| Inline magic values | 35 in 33.42 thousand lines | 94.8% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1351 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 201 in 33.42 thousand lines | 80.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 89 in 33.42 thousand lines | 91.1% | 4 | 30 per thousand lines |
| Overlong function names | 2 in 1122 functions | 98.2% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 47 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **88.7%** | **20** | |
| Conditions with calls tangled inside calls | 25 in 1463 branches | 93.2% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1463 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 32 in 1122 functions | 71.5% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 95 in 95 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 405 | 282 | 11,165 |
| backend | 386 | 383 | 11,682 |
| shared | 120 | 119 | 3,763 |
| api | 105 | 105 | 4,872 |
| tooling | 102 | 0 | 0 |
| database | 70 | 0 | 0 |
| tests | 57 | 57 | 1,941 |
| docs | 49 | 0 | 0 |
| infrastructure | 13 | 0 | 0 |
| **whole repository** | **1,307** | **946** | **33,423** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 946, totalLines: 33423, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 4, totalFunctions: 1122, elseBlocks: 0, ifBlocks: 1463, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 2, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 32, measurementIsHeuristic: True |
| duplication | clones: 6, duplicatedLines: 58, totalLines: 30513, duplicatedPercentage: 0.19 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 78, filesWithComments: 34, taskMarkers: 0 |
| magicValues | inlineHexColours: 4, inlineStyleAttributes: 1, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 201, deeplyIndentedLines: 89, overlongLines: 77, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 25, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1122 |
| designPatterns | roleFamilies: 53, predictedFiles: 47, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 31, components: 229, orphanComponents: 0, averagePageLines: 49 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 84, limitedColumns: 0, writeDoors: 95, unvalidatedDoors: 95, looserLimits: 0 |
| fileAreas | totalFiles: 1307, frontend: 405, backend: 386, shared: 120, api: 105, tooling: 102, database: 70, tests: 57, docs: 49, infrastructure: 13 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | not measured | 87.7% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 6 | 4 | better |
| functionShape.elseBlocks | 1 | 0 | better |
| duplication.duplicatedPercentage | 0.42 | 0.19 | better |
| comments.explanatoryCommentLines | 90 | 78 | better |
| magicValues.inlineHexColours | 4 | 4 | held |
| inventory.orphanComponents | 3 | 0 | better |
| orphans.orphanFunctions | None | 0 | — |
| prose.longMemberChainLines | 208 | 201 | better |
| prose.deeplyIndentedLines | 113 | 89 | better |
| functionNames.overlongFunctionNames | 2 | 2 | held |
| accessorNames.gluedAccessorNames | None | 32 | — |
| conditions.tangledConditionLines | None | 25 | — |
| conditions.literalComparisonLines | None | 0 | — |
| designPatterns.predictedFilesMissing | None | 0 | — |
| siteDefinition.handRolledElements | None | None | — |
| siteDefinition.boxedContentWidgets | None | None | — |
| inputValidation.unvalidatedDoors | None | 95 | — |
| inputValidation.looserLimits | None | 0 | — |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
