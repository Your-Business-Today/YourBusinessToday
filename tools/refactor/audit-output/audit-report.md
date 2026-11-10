# Refactor audit

Generated 2026-11-10 18:47 UTC.

## Headline

**Code quality score 96.5%.** **0 of 2,888 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.9%** | **52** | |
| Files over the line limit | 0 in 2888 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 4251 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 4263 branches | 100.0% | 5 | 50% of branches |
| Duplication % | not measured | not measured | — | 20 |
| Explanatory comment lines | 0 in 106.52 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 6 in 106.52 thousand lines | 99.7% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 4765 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 106.52 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 106.52 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 4251 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **97.3%** | **10** | |
| Files the patterns predict but are missing | 2 in 146 predicted files | 97.3% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **99.8%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 4263 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 4263 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 3 in 4251 functions | 99.3% | 6 | 10% of functions |
| **Widget adoption** | | **61.7%** | **8** | |
| Markup written by hand where a widget should be | 35 in 183 widget slots | 61.7% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 253 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 943 | 933 | 30,387 |
| frontend | 752 | 622 | 21,238 |
| shared | 575 | 561 | 19,677 |
| tests | 403 | 388 | 17,343 |
| api | 370 | 369 | 17,322 |
| database | 177 | 7 | 212 |
| tooling | 123 | 8 | 344 |
| docs | 65 | 0 | 0 |
| infrastructure | 17 | 0 | 0 |
| **whole repository** | **3,425** | **2,888** | **106,523** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 2888, totalLines: 106523, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 4251, elseBlocks: 0, ifBlocks: 4263, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 3, measurementIsHeuristic: True |
| duplication | skipped: jscpd is not installed (npm install -g jscpd) |
| naming | bannedAbbreviationHits: 48, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 6 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 239, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 4251 |
| designPatterns | roleFamilies: 161, predictedFiles: 146, predictedFilesMissing: 2, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 50, components: 514, orphanComponents: 0, averagePageLines: 45 |
| siteDefinition | routes: 49, views: 567, siteComponents: 510, catalogue: 7, widgetUsages: 148, handRolledElements: 35, widgetSlots: 183, viewsWithHandRolled: 32, boxedContentWidgets: 0, designSheets: 4, designsLastChecked: never, brandCheckedAt: never |
| inputValidation | schemaTables: 164, limitedColumns: 0, writeDoors: 253, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 3425, backend: 943, frontend: 752, shared: 575, tests: 403, api: 370, database: 177, tooling: 123, docs: 65, infrastructure: 17 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 99.9% | 96.5% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.0 | None | — |
| comments.explanatoryCommentLines | 0 | 0 | held |
| magicValues.inlineHexColours | 0 | 0 | held |
| inventory.orphanComponents | 0 | 0 | held |
| orphans.orphanFunctions | 0 | 0 | held |
| prose.longMemberChainLines | 0 | 0 | held |
| prose.deeplyIndentedLines | 0 | 0 | held |
| functionNames.overlongFunctionNames | 0 | 0 | held |
| accessorNames.gluedAccessorNames | 0 | 3 | worse |
| conditions.tangledConditionLines | 0 | 0 | held |
| conditions.literalComparisonLines | 0 | 0 | held |
| designPatterns.predictedFilesMissing | 0 | 2 | worse |
| siteDefinition.handRolledElements | None | 35 | — |
| siteDefinition.boxedContentWidgets | None | 0 | — |
| inputValidation.unvalidatedDoors | 0 | 0 | held |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
