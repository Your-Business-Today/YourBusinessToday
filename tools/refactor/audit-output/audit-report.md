# Refactor audit

Generated 2026-11-11 02:44 UTC.

## Headline

**Code quality score 99.2%.** **0 of 3,742 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 3742 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 5628 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 5459 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.46 | 97.7% | 8 | 20 |
| Explanatory comment lines | 0 in 140.11 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 6 in 140.11 thousand lines | 99.8% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 6248 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 140.11 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 140.11 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 5628 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **97.4%** | **10** | |
| Files the patterns predict but are missing | 3 in 229 predicted files | 97.4% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **99.8%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 5459 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 5459 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 3 in 5628 functions | 99.5% | 6 | 10% of functions |
| **Widget adoption** | | **94.8%** | **8** | |
| Markup written by hand where a widget should be | 8 in 306 widget slots | 94.8% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 311 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 1,168 | 1,158 | 38,340 |
| frontend | 909 | 779 | 26,150 |
| shared | 788 | 770 | 27,734 |
| tests | 558 | 543 | 25,282 |
| api | 477 | 476 | 22,007 |
| database | 200 | 7 | 212 |
| tooling | 141 | 9 | 382 |
| docs | 77 | 0 | 0 |
| infrastructure | 17 | 0 | 0 |
| **whole repository** | **4,335** | **3,742** | **140,107** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 3742, totalLines: 140107, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 5628, elseBlocks: 0, ifBlocks: 5459, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 3, measurementIsHeuristic: True |
| duplication | clones: 66, duplicatedLines: 649, totalLines: 142003, duplicatedPercentage: 0.46 |
| naming | bannedAbbreviationHits: 51, unprefixedBooleans: 3 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 6 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 327, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 5628 |
| designPatterns | roleFamilies: 205, predictedFiles: 229, predictedFilesMissing: 3, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 64, components: 620, orphanComponents: 0, averagePageLines: 46 |
| siteDefinition | routes: 63, views: 687, siteComponents: 613, catalogue: 10, widgetUsages: 298, handRolledElements: 8, widgetSlots: 306, viewsWithHandRolled: 8, boxedContentWidgets: 0, designSheets: 7, designsLastChecked: 2026-11-10, brandCheckedAt: never |
| inputValidation | schemaTables: 197, limitedColumns: 0, writeDoors: 311, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 4335, backend: 1168, frontend: 909, shared: 788, tests: 558, api: 477, database: 200, tooling: 141, docs: 77, infrastructure: 17 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 97.8% | 99.2% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.47 | 0.46 | better |
| comments.explanatoryCommentLines | 0 | 0 | held |
| magicValues.inlineHexColours | 0 | 0 | held |
| inventory.orphanComponents | 0 | 0 | held |
| orphans.orphanFunctions | 0 | 0 | held |
| prose.longMemberChainLines | 0 | 0 | held |
| prose.deeplyIndentedLines | 0 | 0 | held |
| functionNames.overlongFunctionNames | 0 | 0 | held |
| accessorNames.gluedAccessorNames | 3 | 3 | held |
| conditions.tangledConditionLines | 0 | 0 | held |
| conditions.literalComparisonLines | 0 | 0 | held |
| designPatterns.predictedFilesMissing | 3 | 3 | held |
| siteDefinition.handRolledElements | 36 | 8 | better |
| siteDefinition.boxedContentWidgets | 0 | 0 | held |
| inputValidation.unvalidatedDoors | 0 | 0 | held |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
