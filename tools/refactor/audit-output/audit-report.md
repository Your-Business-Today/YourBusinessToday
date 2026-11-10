# Refactor audit

Generated 2026-11-10 21:26 UTC.

## Headline

**Code quality score 97.9%.** **0 of 3,612 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.9%** | **60** | |
| Files over the line limit | 0 in 3612 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 5416 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 5283 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 135.19 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 9 in 135.19 thousand lines | 99.7% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 6025 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 135.19 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 135.19 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 5416 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **97.3%** | **10** | |
| Files the patterns predict but are missing | 3 in 225 predicted files | 97.3% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **99.8%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 5283 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 5283 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 3 in 5416 functions | 99.4% | 6 | 10% of functions |
| **Widget adoption** | | **76.4%** | **8** | |
| Markup written by hand where a widget should be | 36 in 305 widget slots | 76.4% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 308 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 1,125 | 1,115 | 37,141 |
| frontend | 894 | 764 | 25,743 |
| shared | 760 | 742 | 26,813 |
| tests | 530 | 515 | 23,752 |
| api | 462 | 461 | 21,185 |
| database | 193 | 7 | 212 |
| tooling | 123 | 8 | 344 |
| docs | 77 | 0 | 0 |
| infrastructure | 17 | 0 | 0 |
| **whole repository** | **4,181** | **3,612** | **135,190** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 3612, totalLines: 135190, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 5416, elseBlocks: 0, ifBlocks: 5283, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 3, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 77477, duplicatedPercentage: 0.0, carriedFromBaseline: True |
| naming | bannedAbbreviationHits: 51, unprefixedBooleans: 3 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 9 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 301, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 5416 |
| designPatterns | roleFamilies: 200, predictedFiles: 225, predictedFilesMissing: 3, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 64, components: 609, orphanComponents: 0, averagePageLines: 46 |
| siteDefinition | routes: 63, views: 676, siteComponents: 602, catalogue: 10, widgetUsages: 269, handRolledElements: 36, widgetSlots: 305, viewsWithHandRolled: 33, boxedContentWidgets: 0, designSheets: 7, designsLastChecked: 2026-11-10, brandCheckedAt: never |
| inputValidation | schemaTables: 190, limitedColumns: 0, writeDoors: 308, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 4181, backend: 1125, frontend: 894, shared: 760, tests: 530, api: 462, database: 193, tooling: 123, docs: 77, infrastructure: 17 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 99.9% | 97.9% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.0 | 0.0 | held |
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
| designPatterns.predictedFilesMissing | 0 | 3 | worse |
| siteDefinition.handRolledElements | None | 36 | — |
| siteDefinition.boxedContentWidgets | None | 0 | — |
| inputValidation.unvalidatedDoors | 0 | 0 | held |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
