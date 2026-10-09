# Refactor audit — baseline v3, adopted from drift

Generated 2026-10-09 from refactor/round-2 at the start of round 2, replacing the v2 baseline of 2026-10-06 without a round between them.

Adopted from drift: the gate failed on duplication, 0.19% → 0.26% (6 clones and 58 lines → 11 clones and 99 lines), from code landed on main since v2 — the landing, about, offer and vision pages' markup, and an eight-line clone between the project's `taskActions.ts` and the task page's `+page.server.ts`. Every ratcheted figure the gate holds was otherwise level or better (functions over the limit 4, else blocks 0, orphans 0, missing predicted files 0, unvalidated doors 95 → 91, looser limits 0). The code quality score read 88.1% at the start of the round. The v2 report follows unchanged; round 2 replaces the whole of it when it ends.

---

# Refactor audit — baseline v2, after round 1

Generated 2026-10-06 from refactor/round-1, replacing the v1 baseline of 2026-09-15.

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 84.1% → 87.7%.** **0 of 946 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. (The v1 baseline predates the score; 84.1% is the reading taken at the start of the round, against which the gate passed.)

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **97.0%** | **60** | |
| Files over the line limit | 0 in 946 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 4 in 1122 functions | 98.6% | 8 | 25% of functions |
| Else blocks | 0 in 1463 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.19 | 99.1% | 8 | 20 |
| Explanatory comment lines | 78 in 33.42 thousand lines | 95.3% | 4 | 50 per thousand lines |
| Inline magic values | 35 in 33.42 thousand lines | 94.8% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1351 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 201 in 33.42 thousand lines | 80.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 89 in 33.42 thousand lines | 91.1% | 4 | 30 per thousand lines |
| Overlong function names | 2 in 1122 functions | 98.2% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 47 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **88.7%** | **20** | |
| Conditions with calls tangled inside calls | 25 in 1463 branches | 93.2% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1463 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 32 in 1122 functions | 71.5% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 95 in 95 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.


## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 946, totalLines: 33423, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 4, totalFunctions: 1122, elseBlocks: 0, ifBlocks: 1463, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 2, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 32, measurementIsHeuristic: True |
| duplication | clones: 6, duplicatedLines: 58, totalLines: 30513, duplicatedPercentage: 0.19 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 78, filesWithComments: 34, taskMarkers: 0 |
| magicValues | inlineHexColours: 4, inlineStyleAttributes: 1, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 201, deeplyIndentedLines: 89, overlongLines: 77, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 25, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1122 |
| designPatterns | roleFamilies: 53, predictedFiles: 47, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 31, components: 229, orphanComponents: 0, averagePageLines: 49 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 84, limitedColumns: 0, writeDoors: 95, unvalidatedDoors: 95, looserLimits: 0 |
| fileAreas | totalFiles: 1307, frontend: 405, backend: 386, shared: 120, api: 105, tooling: 102, database: 70, tests: 57, docs: 49, infrastructure: 13 |

## Round 1 — the orphans, the accepted gaps and the literal comparisons

The round started from a green gate (no drift since v1) and took the plan from the top: the two word-for-word duplicate lookups, the 29 orphans, the four predicted files, then the whole of the first sweep element. Nothing over the file limit existed to break out, so the round was the plan's Pass 3, Pass 4 and the first step of Pass 5. Behaviour is unchanged: typecheck, 236 tests and the production build are green after every step.

- **Give `findProject / getProject` one home, give `findTask / getTask` one home** (steps 1–2): `findProject` in `projectBoard.ts` and `findTask` in `taskSiblings.ts` were deleted; their eight callers (set/place/move/delete for projects and tasks) now import `getProject` and `getTask`. Duplication 0.28% → 0.19%.
- **Remove the 29 components and functions nothing calls** (step 3): every orphan was confirmed to have no caller anywhere in `src`, tests included, then deleted. Deleting them left 21 more files that only the deleted ones imported — the workflow map and its six role lines, the admin usage report and its summaries, the two invite emails, the brain upload rules, the scripted project conversation — so those went too, and `formatPenceAsPounds` was the last of the chain. 38 files and 5 functions in kept files removed; orphans 29 → 0, `src/lib/components/project/` and `src/lib/server/admin/usage/` are gone.
- **Complete the pattern: every status has an actions / a record** (steps 4–5): the audit reads `updateTaskStatus` as subject `updateTask` with role `status` and predicts `updateTaskActions.ts` and `updateTaskRecord.ts`. No code does that job; both are accepted gaps in `rules.json`, as `updateTask.ts` and `updateProject.ts` already were for the same misreading. Missing predicted files 2 → 0.
- **Complete the pattern: every goal has a project / a task** (steps 6–7): already recorded as accepted gaps before the round; the audit counts them as satisfied. The plan still prints them (it reads the patterns, not the gaps), so the next round skips them.
- **Conditions compared to a raw literal: 110 → 0** (step 8, both batches of fifty): every union the code compares against gained a const object beside its type in the module that owns it — `taskKinds`, `taskStatuses`, `projectStatusFilters`, `emailDeliveries`, `dropPlacements`, `moveDirections`, `actionAudiences`, `repositoryFileKinds`, `sourceFetchStatuses`, `uploadRecordingStatuses`, `uploadGrantStandings`, `attachmentRecordings`, `inviteOutcomes`, `addContactOutcomes`, `affiliationOutcomes`, `personProfileSaves`, `pullRequestChanges`, `oauthTokenKinds`, `taskMoveChoiceKinds`, `researchOutcomeKinds`, `notificationSubjectKinds`, `stationStates`, `kitStandings`, `attachmentPreviewKinds`, `personNoteKinds`, `attachmentLinkKinds` — following the `awaitingKinds` convention already in `conversationTurn.ts`. Three small named modules were added for values the code does not own: `client/actionResultTypes.ts` (SvelteKit's action result types), `client/keyboardKeys.ts` (the Escape key) and `clientDocuments/docx/markdownTokenTypes.ts` (marked's token types). The display-name limit of 60 moved to `data/displayNameRules.ts`, read by both the form's `maxlength` and the server action, so it is stated once. Two unions a browser component compares (`attachmentLinkKinds`, `personNoteKinds`) moved from server modules to `src/lib/data/` because the build's server guard refuses a value import from `$lib/server` in the browser; the server modules re-export the type.
- **Else blocks: 1 → 0** (step 18, taken on the way): `FormTracker`'s `else if` on the action result became an early return.
- **Held**: files over the limit 0, worst file 0, functions over the limit 6 → 4 (the deleted code carried two), overlong function names 2, comments 90 → 78 (the deleted files carried twelve), magic values 36 → 35, input validation unvalidated doors 95 (never swept by a round) and looser limits 0.
- **Division signature**: none accepted. No file was divided this round; file count fell 977 → 946.
- **Put back**: nothing. No step needed a second attempt.
- **Drift noted, not this round's**: long member chain lines read 58 at v1 and 201 at the start of this round, and overlong lines 54 → 77, from code landed between the baselines (the consultancy offer, case study and legal copy files). Neither figure is ratcheted by the gate; both are on the plan.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) |
| --- | --- | --- |
| Code quality score | — (84.1% read at the round's start) | **87.7%** |
| Worst file (lines) | 0 | **0** |
| Average page length | 54 | **49** |
| Duplication | 0.42% | **0.19%** |
| Else blocks | 1 | **0** |
| Functions over the limit | 6 | **4** |
| Files over the limit | 0 | **0** |
| Orphan functions | — (3 orphan components) | **0** |
| Conditions compared to a raw literal | — (110 at the round's start) | **0** |
| Files the patterns predict but are missing | — (2 at the round's start) | **0** |

## Worst files by length

All 946 files are within the limit.

## Next round, named

The first five steps of the new `tools/refactor/refactor-plan.md`, with the four accepted-gap pattern steps it still prints skipped:

1. Accessor names that want to be a property: 32 to zero (the plan's step 5).
2. Long member chain lines: 201 to zero, fifty at a time (step 6).
3. Deeply indented lines: 89 to zero (step 7).
4. Conditions with calls tangled inside calls: 25 to zero (step 8).
5. Inline magic values: 35 to zero (step 9).

The worst file is now no file: nothing is over the limit, so the next round is wholly the sweep.
