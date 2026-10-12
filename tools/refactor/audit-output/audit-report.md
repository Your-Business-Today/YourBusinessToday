# Refactor audit

Generated 2026-10-12 09:31 UTC.

## Headline

**Code quality score 91.8%.** **0 of 1,388 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.9%** | **60** | |
| Files over the line limit | 0 in 1388 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 1778 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 2138 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.08 | 99.6% | 8 | 20 |
| Explanatory comment lines | 0 in 49.22 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 49.22 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 2107 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 49.22 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 49.22 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 1778 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 98 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 2138 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 2138 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 1778 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 81 in 127 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| backend | 562 | 552 | 17,404 |
| frontend | 532 | 406 | 14,616 |
| shared | 196 | 182 | 5,906 |
| api | 149 | 147 | 7,125 |
| tooling | 110 | 2 | 54 |
| tests | 106 | 99 | 4,111 |
| database | 93 | 0 | 0 |
| docs | 56 | 0 | 0 |
| infrastructure | 13 | 0 | 0 |
| **whole repository** | **1,817** | **1,388** | **49,216** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1388, totalLines: 49216, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 1778, elseBlocks: 0, ifBlocks: 2138, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 6, duplicatedLines: 39, totalLines: 50647, duplicatedPercentage: 0.08 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 0 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 106, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1778 |
| designPatterns | roleFamilies: 73, predictedFiles: 98, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 41, components: 329, orphanComponents: 0, averagePageLines: 47 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 103, limitedColumns: 0, writeDoors: 127, unvalidatedDoors: 81, looserLimits: 0 |
| fileAreas | totalFiles: 1817, backend: 562, frontend: 532, shared: 196, api: 149, tooling: 110, tests: 106, database: 93, docs: 56, infrastructure: 13 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 91.8% | 91.8% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 0 | 0 | held |
| functionShape.elseBlocks | 0 | 0 | held |
| duplication.duplicatedPercentage | 0.0 | 0.08 | worse |
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
| inputValidation.unvalidatedDoors | 82 | 81 | better |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
