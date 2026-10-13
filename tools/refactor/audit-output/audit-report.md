# Refactor audit

Generated 2026-10-13 12:19 UTC.

## Headline

**Code quality score 91.8%.** **0 of 1,576 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 1576 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 2043 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 2373 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 55.26 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 55.26 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 2386 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 55.26 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 55.26 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 2043 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 94 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 2373 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 2373 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 2043 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 75 in 132 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 648 | 638 | 20,112 |
| frontend | 549 | 425 | 15,265 |
| shared | 229 | 215 | 6,831 |
| api | 157 | 157 | 7,529 |
| tests | 143 | 136 | 5,384 |
| tooling | 117 | 5 | 138 |
| database | 104 | 0 | 0 |
| docs | 57 | 0 | 0 |
| infrastructure | 14 | 0 | 0 |
| **whole repository** | **2,018** | **1,576** | **55,259** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1576, totalLines: 55259, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 2043, elseBlocks: 0, ifBlocks: 2373, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 56675, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 0 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 140, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 2043 |
| designPatterns | roleFamilies: 82, predictedFiles: 94, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 43, components: 343, orphanComponents: 0, averagePageLines: 47 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 108, limitedColumns: 0, writeDoors: 132, unvalidatedDoors: 75, looserLimits: 0 |
| fileAreas | totalFiles: 2018, backend: 648, frontend: 549, shared: 229, api: 157, tests: 143, tooling: 117, database: 104, docs: 57, infrastructure: 14 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 91.8% | 91.8% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.04 | 0.0 | better |
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
| siteDefinition.handRolledElements | None | None | — |
| siteDefinition.boxedContentWidgets | None | None | — |
| inputValidation.unvalidatedDoors | 75 | 75 | held |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
