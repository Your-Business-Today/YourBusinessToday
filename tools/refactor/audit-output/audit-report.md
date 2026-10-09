# Refactor audit

Generated 2026-10-09 13:45 UTC.

## Headline

**Code quality score 90.9%.** **0 of 1,044 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **98.4%** | **60** | |
| Files over the line limit | 0 in 1044 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 3 in 1270 functions | 99.1% | 8 | 25% of functions |
| Else blocks | 0 in 1573 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.26 | 98.7% | 8 | 20 |
| Explanatory comment lines | 74 in 37.1 thousand lines | 96.0% | 4 | 50 per thousand lines |
| Inline magic values | 30 in 37.1 thousand lines | 96.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1536 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 109 in 37.1 thousand lines | 90.2% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 37.1 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 2 in 1270 functions | 98.4% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 82 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 1573 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1573 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 1270 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 91 in 98 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 450 | 326 | 12,093 |
| backend | 396 | 393 | 12,162 |
| shared | 151 | 137 | 4,411 |
| api | 116 | 116 | 5,426 |
| tooling | 103 | 0 | 0 |
| database | 75 | 0 | 0 |
| tests | 72 | 72 | 3,012 |
| docs | 52 | 0 | 0 |
| infrastructure | 13 | 0 | 0 |
| **whole repository** | **1,428** | **1,044** | **37,104** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1044, totalLines: 37104, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 3, totalFunctions: 1270, elseBlocks: 0, ifBlocks: 1573, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 2, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 11, duplicatedLines: 99, totalLines: 37840, duplicatedPercentage: 0.26, carriedFromBaseline: True |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 74, filesWithComments: 33, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 109, deeplyIndentedLines: 0, overlongLines: 82, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1270 |
| designPatterns | roleFamilies: 55, predictedFiles: 82, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 33, components: 266, orphanComponents: 0, averagePageLines: 48 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 85, limitedColumns: 0, writeDoors: 98, unvalidatedDoors: 91, looserLimits: 0 |
| fileAreas | totalFiles: 1428, frontend: 450, backend: 396, shared: 151, api: 116, tooling: 103, database: 75, tests: 72, docs: 52, infrastructure: 13 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 88.1% | 90.9% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 4 | 3 | better |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.26 | 0.26 | held |
| comments.explanatoryCommentLines | 78 | 74 | better |
| magicValues.inlineHexColours | 4 | 0 | better |
| inventory.orphanComponents | 0 | 0 | held |
| orphans.orphanFunctions | 0 | 0 | held |
| prose.longMemberChainLines | 200 | 109 | better |
| prose.deeplyIndentedLines | 81 | 0 | better |
| functionNames.overlongFunctionNames | 2 | 2 | held |
| accessorNames.gluedAccessorNames | 31 | 0 | better |
| conditions.tangledConditionLines | 25 | 0 | better |
| conditions.literalComparisonLines | 0 | 0 | held |
| designPatterns.predictedFilesMissing | 0 | 0 | held |
| siteDefinition.handRolledElements | None | None | — |
| siteDefinition.boxedContentWidgets | None | None | — |
| inputValidation.unvalidatedDoors | 91 | 91 | held |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
