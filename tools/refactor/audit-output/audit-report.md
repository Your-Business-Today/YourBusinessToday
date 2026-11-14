# Refactor audit

Generated 2026-11-14 23:25 UTC.

## Headline

**Code quality score 99.9%.** **0 of 4,976 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.8%** | **60** | |
| Files over the line limit | 0 in 4976 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 7772 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 7138 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.32 | 98.4% | 8 | 20 |
| Explanatory comment lines | 0 in 190.82 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 190.82 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 8508 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 190.82 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 190.82 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 7772 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 247 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 7138 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 7138 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 7772 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **100.0%** | **8** | |
| Markup written by hand where a widget should be | 0 in 465 widget slots | 100.0% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 399 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 1,466 | 1,455 | 48,955 |
| frontend | 1,193 | 1,063 | 36,542 |
| shared | 964 | 946 | 34,415 |
| tests | 858 | 843 | 40,320 |
| api | 652 | 651 | 29,936 |
| database | 239 | 8 | 254 |
| tooling | 142 | 10 | 401 |
| docs | 79 | 0 | 0 |
| infrastructure | 19 | 0 | 0 |
| **whole repository** | **5,612** | **4,976** | **190,823** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 4976, totalLines: 190823, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 7772, elseBlocks: 0, ifBlocks: 7138, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 72, duplicatedLines: 610, totalLines: 192012, duplicatedPercentage: 0.32, carriedFromBaseline: True |
| naming | bannedAbbreviationHits: 109, unprefixedBooleans: 7 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 657, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 7772 |
| designPatterns | roleFamilies: 248, predictedFiles: 247, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 79, components: 736, orphanComponents: 0, averagePageLines: 44 |
| siteDefinition | routes: 78, views: 818, siteComponents: 724, catalogue: 14, widgetUsages: 465, handRolledElements: 0, widgetSlots: 465, viewsWithHandRolled: 0, boxedContentWidgets: 0, designSheets: 8, designsLastChecked: 2026-11-13, brandCheckedAt: never |
| inputValidation | schemaTables: 226, limitedColumns: 0, writeDoors: 399, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 5612, backend: 1466, frontend: 1193, shared: 964, tests: 858, api: 652, database: 239, tooling: 142, docs: 79, infrastructure: 19 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 99.9% | 99.9% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.32 | 0.32 | held |
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
