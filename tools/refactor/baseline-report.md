# Refactor audit — baseline v15, after round 9

Generated 2026-10-18 from claude/refactor-round-9-2qi5tg, replacing the v13 baseline committed at the end of round 8 (v14 is this round's first commit, adopted from drift).

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 96.8% → 96.8%; the standard baseline checks 99.9% → 100%.** **0 of 1,838 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. The round started from a failing gate: main's 29 commits since round 8 added three clones (duplication 0% → 0.04%), so v14 adopted that reading and the round cleared all three. The score rose from 91.8% at v13 to 96.8% on main's own input validation work (unvalidated doors 75 of 142 → 31 of 157); what holds it below 100% is those 31 doors, which change behaviour and so are never a round's.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 1838 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 2413 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 2758 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 64.47 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 64.47 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 2830 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 64.47 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 64.47 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 2413 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 104 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 2758 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 2758 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 2413 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **60.5%** | **8** | |
| Doors that write without checking their input against the columns | 31 in 157 write doors | 60.5% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1838, totalLines: 64467, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 2413, elseBlocks: 0, ifBlocks: 2758, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 66121, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 28, unprefixedBooleans: 8 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 150, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 2413 |
| designPatterns | roleFamilies: 96, predictedFiles: 104, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 48, components: 417, orphanComponents: 0, averagePageLines: 46 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 112, limitedColumns: 0, writeDoors: 157, unvalidatedDoors: 31, looserLimits: 0 |
| fileAreas | totalFiles: 2302, backend: 720, frontend: 632, shared: 275, api: 188, tests: 173, database: 124, tooling: 117, docs: 59, infrastructure: 14 |

## Round 9 — the three clones

Raised by the deploy count (29 commits on main since the v13 baseline). The gate failed on duplication alone, so the drifted reading was adopted as v14, and the plan then held one step: Pass 5, duplication to zero. Each clone was one concept written twice, and each now has one home; no logic changed.

- **Duplication 0.04% → 0%, the connector's task-and-project lookup** (`localBuildActions.ts`, `taskBranchActions.ts`): both tools read a reachable task and then its project before refusing with `noSuchTask`. That is now `reachableTaskWithProject` in `src/lib/server/mcp/projectAccess.ts`, beside `reachableTask` and `reachableProject`, and both tools call it.
- **Duplication, the task a form names on this project** (`taskActions.ts` twice, `setAutocompleteFromForm.ts`): the read of `taskId`, the check that the task is on the route's project and the refusal *A task on this project is required.* are now `findTaskOnProject` and `taskOnProjectRequired` in `src/lib/server/projects/findTaskOnProject.ts`.
- **Duplication, the autocomplete action** (`projects/[projectId]/autocompleteActions.ts` and `projects/[projectId]/tasks/[taskId]/autocompleteActions.ts`, identical): the action body is now `setTaskAutocompleteAction` in `src/lib/server/autocomplete/setTaskAutocompleteAction.ts`, typed on `RequestEvent<{ projectId: string }>` as `createTaskAction` is, and both routes name it.
- **Held**: files over the limit 0, worst file 0, functions over the limit 0, else blocks 0, orphans 0, missing predicted files 0, tangled conditions 0, literal comparisons 0, comments 0, member chains 0, deeply indented lines 0, overlong function names 0, accessor names 0, magic values 0, input validation looser limits 0 and unvalidated doors 31 of 157 (no round sweeps it).
- **Left as it is**: unprefixed booleans 0 → 8 and abbreviation hits 27 → 28 arrived with main's work; neither is scored or ratcheted, so the plan carries no step for them. Overlong lines 152 → 150.
- **Division signature**: two new files from the round (1,836 → 1,838 source files), each one home for a concept that had two or three.
- **Put back**: nothing.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) | v5 (2026-10-10) | v6 (2026-10-11) | v7 (2026-10-12, drift) | v8 (2026-10-12) | v9 (2026-10-13, drift) | v10 (2026-10-13) | v11 (2026-10-17, drift) | v12 (2026-10-17) | v13 (2026-10-17) | v14 (2026-10-18, drift) | v15 (2026-10-18) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | 91.2% | 91.6% | 91.7% | 91.8% | **91.8%** | 91.8% | **91.8%** | 91.8% | **91.8%** | **91.8%** | 96.8% | **96.8%** |
| Worst file (lines) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Average page length | 54 | 49 | 48 | 48 | 48 | 48 | 48 | **47** | 47 | **47** | 47 | **47** | **47** | 46 | **46** |
| Duplication | 0.42% | 0.19% | 0.26% | 0.26% | 0% | 0% | 0.03% | **0%** | 0.04% | **0%** | 0.02% | **0%** | **0%** | 0.04% | **0%** |
| Else blocks | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Functions over the limit | 6 | 4 | 4 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Files over the limit | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Accessor names that want to be a property | — | 32 | 31 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Long member chain lines | 58 | 201 | 200 | 109 | 11 | 7 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Deeply indented lines | — | 89 | 81 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Explanatory comment lines | — | 78 | 78 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Overlong function names | — | 2 | 2 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Inline hex colours and styles | — | 5 | 5 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** |
| Inline magic values (repeated literals) | — | — | 30 | 30 | 30 | 30 (66 literals repeated, 699 uses; 67 and 760 at the start) | 2 | **0** | 2 | **0** | 0 | **0** | **0** | 0 | **0** |
| Unprefixed booleans | — | — | — | — | — | — | 4 | **0** | 0 | **0** | 0 | **0** | **0** | 8 | 8 |

## Worst files by length

All 1,838 files are within the limit.

## Next round, named

The new `tools/refactor/refactor-plan.md` is empty: every figure a round can move is at zero, and there is no worst file. The next round holds the gate against whatever main adds. The score's remaining 3.2 points are input validation, which a `fix/` branch moves (*"Run the input validation check"* shows where).
