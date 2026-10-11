# Refactor audit

Generated 2026-10-11 16:21 UTC.

## Headline

**Code quality score 91.7%.** **0 of 1,167 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 1167 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 1440 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 1763 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 41.44 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 30 in 41.44 thousand lines | 96.4% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1741 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 7 in 41.44 thousand lines | 99.4% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 41.44 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 1440 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 88 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 1763 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1763 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 1440 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 84 in 113 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 490 | 366 | 13,288 |
| backend | 438 | 435 | 13,473 |
| shared | 170 | 156 | 5,029 |
| api | 130 | 130 | 6,201 |
| tooling | 105 | 0 | 0 |
| tests | 85 | 80 | 3,452 |
| database | 79 | 0 | 0 |
| docs | 54 | 0 | 0 |
| infrastructure | 13 | 0 | 0 |
| **whole repository** | **1,564** | **1,167** | **41,443** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1167, totalLines: 41443, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 1440, elseBlocks: 0, ifBlocks: 1763, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 42648, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 7, deeplyIndentedLines: 0, overlongLines: 86, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1440 |
| designPatterns | roleFamilies: 63, predictedFiles: 88, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 36, components: 301, orphanComponents: 0, averagePageLines: 48 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 88, limitedColumns: 0, writeDoors: 113, unvalidatedDoors: 84, looserLimits: 0 |
| fileAreas | totalFiles: 1564, frontend: 490, backend: 438, shared: 170, api: 130, tooling: 105, tests: 85, database: 79, docs: 54, infrastructure: 13 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 91.6% | 91.7% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.0 | 0.0 | held |
| comments.explanatoryCommentLines | 0 | 0 | held |
| magicValues.inlineHexColours | 0 | 0 | held |
| inventory.orphanComponents | 0 | 0 | held |
| orphans.orphanFunctions | 0 | 0 | held |
| prose.longMemberChainLines | 11 | 7 | better |
| prose.deeplyIndentedLines | 0 | 0 | held |
| functionNames.overlongFunctionNames | 0 | 0 | held |
| accessorNames.gluedAccessorNames | 0 | 0 | held |
| conditions.tangledConditionLines | 0 | 0 | held |
| conditions.literalComparisonLines | 0 | 0 | held |
| designPatterns.predictedFilesMissing | 0 | 0 | held |
| siteDefinition.handRolledElements | None | None | — |
| siteDefinition.boxedContentWidgets | None | None | — |
| inputValidation.unvalidatedDoors | 86 | 84 | better |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
