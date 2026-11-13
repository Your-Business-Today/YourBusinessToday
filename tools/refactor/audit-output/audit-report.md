# Refactor audit

Generated 2026-11-13 07:55 UTC.

## Headline

**Code quality score 99.8%.** **0 of 4,255 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 4255 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 6367 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 6117 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.41 | 98.0% | 8 | 20 |
| Explanatory comment lines | 0 in 159.06 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 2 in 159.06 thousand lines | 99.9% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 7047 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 159.06 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 159.06 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 6367 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 245 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 6117 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 6117 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 6367 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **100.0%** | **8** | |
| Markup written by hand where a widget should be | 0 in 411 widget slots | 100.0% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 363 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 1,262 | 1,252 | 41,167 |
| frontend | 1,050 | 920 | 30,580 |
| shared | 847 | 829 | 29,499 |
| tests | 684 | 670 | 31,328 |
| api | 568 | 568 | 25,890 |
| database | 214 | 7 | 212 |
| tooling | 141 | 9 | 382 |
| docs | 79 | 0 | 0 |
| infrastructure | 17 | 0 | 0 |
| **whole repository** | **4,862** | **4,255** | **159,058** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 4255, totalLines: 159058, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 6367, elseBlocks: 0, ifBlocks: 6117, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 66, duplicatedLines: 617, totalLines: 151337, duplicatedPercentage: 0.41, carriedFromBaseline: True |
| naming | bannedAbbreviationHits: 89, unprefixedBooleans: 3 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 2 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 422, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 6367 |
| designPatterns | roleFamilies: 228, predictedFiles: 245, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 73, components: 680, orphanComponents: 0, averagePageLines: 44 |
| siteDefinition | routes: 72, views: 756, siteComponents: 668, catalogue: 14, widgetUsages: 411, handRolledElements: 0, widgetSlots: 411, viewsWithHandRolled: 0, boxedContentWidgets: 0, designSheets: 8, designsLastChecked: 2026-11-13, brandCheckedAt: never |
| inputValidation | schemaTables: 211, limitedColumns: 0, writeDoors: 363, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 4862, backend: 1262, frontend: 1050, shared: 847, tests: 684, api: 568, database: 214, tooling: 141, docs: 79, infrastructure: 17 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 99.8% | 99.8% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.41 | 0.41 | held |
| comments.explanatoryCommentLines | 0 | 0 | held |
| magicValues.inlineHexColours | 0 | 0 | held |
| inventory.orphanComponents | 0 | 0 | held |
| orphans.orphanFunctions | 0 | 0 | held |
| prose.longMemberChainLines | 0 | 0 | held |
| prose.deeplyIndentedLines | 0 | 0 | held |
| functionNames.overlongFunctionNames | 0 | 0 | held |
| accessorNames.gluedAccessorNames | 0 | 0 | held |
| conditions.tangledConditionLines | 0 | 0 | held |
| conditions.literalComparisonLines | 0 | 0 | held |
| designPatterns.predictedFilesMissing | 0 | 0 | held |
| siteDefinition.handRolledElements | 0 | 0 | held |
| siteDefinition.boxedContentWidgets | 0 | 0 | held |
| inputValidation.unvalidatedDoors | 0 | 0 | held |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
