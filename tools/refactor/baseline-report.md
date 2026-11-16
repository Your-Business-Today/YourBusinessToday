# Refactor audit

Generated 2026-11-16 11:58 UTC.

## Headline

**Code quality score 99.9%.** **0 of 5,122 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.8%** | **60** | |
| Files over the line limit | 0 in 5122 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 7998 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 7253 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.32 | 98.4% | 8 | 20 |
| Explanatory comment lines | 0 in 197.51 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 197.51 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 8743 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 197.51 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 197.51 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 7998 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 249 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 7253 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 7253 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 7998 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **100.0%** | **8** | |
| Markup written by hand where a widget should be | 0 in 468 widget slots | 100.0% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 404 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 1,506 | 1,495 | 50,669 |
| frontend | 1,205 | 1,075 | 36,843 |
| shared | 972 | 954 | 34,673 |
| tests | 936 | 915 | 44,068 |
| api | 667 | 666 | 30,629 |
| database | 251 | 8 | 254 |
| tooling | 167 | 9 | 370 |
| docs | 79 | 0 | 0 |
| infrastructure | 19 | 0 | 0 |
| **whole repository** | **5,802** | **5,122** | **197,506** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 5122, totalLines: 197506, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 7998, elseBlocks: 0, ifBlocks: 7253, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 74, duplicatedLines: 637, totalLines: 200393, duplicatedPercentage: 0.32 |
| naming | bannedAbbreviationHits: 128, unprefixedBooleans: 11 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 770, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 7998 |
| designPatterns | roleFamilies: 251, predictedFiles: 249, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 80, components: 745, orphanComponents: 0, averagePageLines: 44 |
| siteDefinition | routes: 79, views: 828, siteComponents: 733, catalogue: 14, widgetUsages: 468, handRolledElements: 0, widgetSlots: 468, viewsWithHandRolled: 0, boxedContentWidgets: 0, designSheets: 8, designsLastChecked: 2026-11-13, brandCheckedAt: never |
| inputValidation | schemaTables: 228, limitedColumns: 0, writeDoors: 404, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 5802, backend: 1506, frontend: 1205, shared: 972, tests: 936, api: 667, database: 251, tooling: 167, docs: 79, infrastructure: 19 |

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
