# Refactor audit

Generated 2026-11-13 05:41 UTC.

## Headline

**Code quality score 99.8%.** **0 of 4,284 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 4284 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 6452 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 6285 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.41 | 98.0% | 8 | 20 |
| Explanatory comment lines | 0 in 161.18 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 2 in 161.18 thousand lines | 99.9% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 7137 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 161.18 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 161.18 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 6452 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 267 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 6285 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 6285 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 6452 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **100.0%** | **8** | |
| Markup written by hand where a widget should be | 0 in 394 widget slots | 100.0% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 377 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 1,267 | 1,263 | 41,797 |
| frontend | 1,038 | 913 | 30,424 |
| shared | 850 | 837 | 29,824 |
| tests | 682 | 670 | 31,615 |
| api | 584 | 585 | 26,923 |
| database | 212 | 7 | 212 |
| tooling | 141 | 9 | 382 |
| docs | 79 | 0 | 0 |
| infrastructure | 17 | 0 | 0 |
| **whole repository** | **4,870** | **4,284** | **161,177** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 4284, totalLines: 161177, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 6452, elseBlocks: 0, ifBlocks: 6285, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 66, duplicatedLines: 617, totalLines: 151337, duplicatedPercentage: 0.41, carriedFromBaseline: True |
| naming | bannedAbbreviationHits: 89, unprefixedBooleans: 3 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 2 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 443, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 6452 |
| designPatterns | roleFamilies: 231, predictedFiles: 267, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 74, components: 685, orphanComponents: 0, averagePageLines: 43 |
| siteDefinition | routes: 73, views: 762, siteComponents: 673, catalogue: 14, widgetUsages: 394, handRolledElements: 0, widgetSlots: 394, viewsWithHandRolled: 0, boxedContentWidgets: 0, designSheets: 8, designsLastChecked: 2026-11-13, brandCheckedAt: never |
| inputValidation | schemaTables: 210, limitedColumns: 0, writeDoors: 377, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 4870, backend: 1267, frontend: 1038, shared: 850, tests: 682, api: 584, database: 212, tooling: 141, docs: 79, infrastructure: 17 |

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
