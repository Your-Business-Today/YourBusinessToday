# Refactor audit

Generated 2026-11-28 05:39 UTC.

## Headline

**Code quality score 99.8%.** **0 of 6,168 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 6168 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 9604 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 8941 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.43 | 97.9% | 8 | 20 |
| Explanatory comment lines | 0 in 237.73 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 2 in 237.73 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 10469 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 237.73 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 237.73 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 9604 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 314 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **99.9%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 8941 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 8941 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 2 in 9604 functions | 99.8% | 6 | 10% of functions |
| **Widget adoption** | | **100.0%** | **8** | |
| Markup written by hand where a widget should be | 0 in 612 widget slots | 100.0% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 491 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json` once the audit has run there; git ignores it.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 1,800 | 1,789 | 61,289 |
| frontend | 1,375 | 1,245 | 42,260 |
| tests | 1,177 | 1,156 | 55,106 |
| shared | 1,164 | 1,146 | 41,070 |
| api | 816 | 815 | 37,385 |
| database | 298 | 8 | 254 |
| tooling | 165 | 9 | 370 |
| docs | 90 | 0 | 0 |
| infrastructure | 19 | 0 | 0 |
| **whole repository** | **6,904** | **6,168** | **237,734** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 6168, totalLines: 237734, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 9604, elseBlocks: 0, ifBlocks: 8941, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 2, measurementIsHeuristic: True |
| duplication | clones: 109, duplicatedLines: 1025, totalLines: 241063, duplicatedPercentage: 0.43 |
| naming | bannedAbbreviationHits: 208, unprefixedBooleans: 11 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 2 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 989, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 9604 |
| designPatterns | roleFamilies: 285, predictedFiles: 314, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 103, components: 865, orphanComponents: 0, averagePageLines: 40 |
| siteDefinition | routes: 102, views: 971, siteComponents: 853, catalogue: 14, widgetUsages: 612, handRolledElements: 0, widgetSlots: 612, viewsWithHandRolled: 0, boxedContentWidgets: 0, designSheets: 8, designsLastChecked: 2026-11-13, brandCheckedAt: never |
| inputValidation | schemaTables: 272, limitedColumns: 0, writeDoors: 491, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 6904, backend: 1800, frontend: 1375, tests: 1177, shared: 1164, api: 816, database: 298, tooling: 165, docs: 90, infrastructure: 19 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 99.8% | 99.8% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.4 | 0.43 | worse |
| comments.explanatoryCommentLines | 0 | 0 | held |
| magicValues.inlineHexColours | 0 | 0 | held |
| inventory.orphanComponents | 0 | 0 | held |
| orphans.orphanFunctions | 0 | 0 | held |
| prose.longMemberChainLines | 0 | 0 | held |
| prose.deeplyIndentedLines | 0 | 0 | held |
| functionNames.overlongFunctionNames | 0 | 0 | held |
| accessorNames.gluedAccessorNames | 0 | 2 | worse |
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
