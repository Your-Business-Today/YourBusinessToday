# Refactor audit

Generated 2026-10-10 18:36 UTC.

## Headline

**Code quality score 91.6%.** **0 of 1,075 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 1075 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 1325 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 1616 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 38.32 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 30 in 38.32 thousand lines | 96.1% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1605 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 11 in 38.32 thousand lines | 99.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 38.32 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 1325 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 84 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 1616 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1616 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 1325 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 86 in 101 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 465 | 341 | 12,466 |
| backend | 404 | 401 | 12,526 |
| shared | 156 | 142 | 4,601 |
| api | 118 | 118 | 5,604 |
| tooling | 104 | 0 | 0 |
| tests | 77 | 73 | 3,123 |
| database | 76 | 0 | 0 |
| docs | 53 | 0 | 0 |
| infrastructure | 13 | 0 | 0 |
| **whole repository** | **1,466** | **1,075** | **38,320** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1075, totalLines: 38320, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 1325, elseBlocks: 0, ifBlocks: 1616, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 39299, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 11, deeplyIndentedLines: 0, overlongLines: 85, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1325 |
| designPatterns | roleFamilies: 56, predictedFiles: 84, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 34, components: 280, orphanComponents: 0, averagePageLines: 48 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 86, limitedColumns: 0, writeDoors: 101, unvalidatedDoors: 86, looserLimits: 0 |
| fileAreas | totalFiles: 1466, frontend: 465, backend: 404, shared: 156, api: 118, tooling: 104, tests: 77, database: 76, docs: 53, infrastructure: 13 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 91.2% | 91.6% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.26 | 0.0 | better |
| comments.explanatoryCommentLines | 0 | 0 | held |
| magicValues.inlineHexColours | 0 | 0 | held |
| inventory.orphanComponents | 0 | 0 | held |
| orphans.orphanFunctions | 0 | 0 | held |
| prose.longMemberChainLines | 109 | 11 | better |
| prose.deeplyIndentedLines | 0 | 0 | held |
| functionNames.overlongFunctionNames | 0 | 0 | held |
| accessorNames.gluedAccessorNames | 0 | 0 | held |
| conditions.tangledConditionLines | 0 | 0 | held |
| conditions.literalComparisonLines | 0 | 0 | held |
| designPatterns.predictedFilesMissing | 0 | 0 | held |
| siteDefinition.handRolledElements | None | None | — |
| siteDefinition.boxedContentWidgets | None | None | — |
| inputValidation.unvalidatedDoors | 91 | 86 | better |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
