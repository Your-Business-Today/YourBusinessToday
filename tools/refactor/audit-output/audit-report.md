# Refactor audit

Generated 2026-10-09 08:43 UTC.

## Headline

**Code quality score 88.1%.** **0 of 1,018 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **97.3%** | **60** | |
| Files over the line limit | 0 in 1018 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 4 in 1238 functions | 98.7% | 8 | 25% of functions |
| Else blocks | 0 in 1566 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.19 | 99.1% | 8 | 20 |
| Explanatory comment lines | 78 in 36.52 thousand lines | 95.7% | 4 | 50 per thousand lines |
| Inline magic values | 35 in 36.52 thousand lines | 95.2% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1486 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 201 in 36.52 thousand lines | 81.7% | 4 | 30 per thousand lines |
| Deeply indented lines | 81 in 36.52 thousand lines | 92.6% | 4 | 30 per thousand lines |
| Overlong function names | 2 in 1238 functions | 98.4% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 82 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **89.9%** | **20** | |
| Conditions with calls tangled inside calls | 25 in 1566 branches | 93.6% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1566 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 31 in 1238 functions | 75.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 91 in 98 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 424 | 308 | 11,911 |
| backend | 391 | 392 | 12,046 |
| shared | 141 | 134 | 4,338 |
| api | 113 | 114 | 5,321 |
| tooling | 103 | 0 | 0 |
| database | 73 | 0 | 0 |
| tests | 68 | 70 | 2,904 |
| docs | 51 | 0 | 0 |
| infrastructure | 13 | 0 | 0 |
| **whole repository** | **1,377** | **1,018** | **36,520** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1018, totalLines: 36520, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 4, totalFunctions: 1238, elseBlocks: 0, ifBlocks: 1566, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 2, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 31, measurementIsHeuristic: True |
| duplication | clones: 6, duplicatedLines: 58, totalLines: 30513, duplicatedPercentage: 0.19, carriedFromBaseline: True |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 78, filesWithComments: 34, taskMarkers: 0 |
| magicValues | inlineHexColours: 4, inlineStyleAttributes: 1, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 201, deeplyIndentedLines: 81, overlongLines: 82, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 25, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1238 |
| designPatterns | roleFamilies: 56, predictedFiles: 82, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 33, components: 248, orphanComponents: 0, averagePageLines: 49 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 85, limitedColumns: 0, writeDoors: 98, unvalidatedDoors: 91, looserLimits: 0 |
| fileAreas | totalFiles: 1377, frontend: 424, backend: 391, shared: 141, api: 113, tooling: 103, database: 73, tests: 68, docs: 51, infrastructure: 13 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 87.7% | 88.1% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 4 | 4 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.19 | 0.19 | held |
| comments.explanatoryCommentLines | 78 | 78 | held |
| magicValues.inlineHexColours | 4 | 4 | held |
| inventory.orphanComponents | 0 | 0 | held |
| orphans.orphanFunctions | 0 | 0 | held |
| prose.longMemberChainLines | 201 | 201 | held |
| prose.deeplyIndentedLines | 89 | 81 | better |
| functionNames.overlongFunctionNames | 2 | 2 | held |
| accessorNames.gluedAccessorNames | 32 | 31 | better |
| conditions.tangledConditionLines | 25 | 25 | held |
| conditions.literalComparisonLines | 0 | 0 | held |
| designPatterns.predictedFilesMissing | 0 | 0 | held |
| siteDefinition.handRolledElements | None | None | — |
| siteDefinition.boxedContentWidgets | None | None | — |
| inputValidation.unvalidatedDoors | 95 | 91 | better |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
