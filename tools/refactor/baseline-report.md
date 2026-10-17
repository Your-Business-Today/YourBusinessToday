# Refactor audit — baseline v12, after round 7

Generated 2026-10-17 from claude/refactor-round-7-068tte, replacing the v11 baseline adopted from drift at the start of the same round (v10 was the end of round 6, 2026-10-13).

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 91.8% → 91.8%; the standard baseline checks 99.9% → 100%.** **0 of 1,734 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. Duplication 0.02% → 0, so every figure a round can move is back at zero and the refactoring plan is empty again. What holds the score at 91.8% is input validation alone (75 of 142 write doors), which changes behaviour and so is never a round's.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 1734 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 2285 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 2622 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 60.93 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 60.93 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 2679 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 60.93 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 60.93 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 2285 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 104 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 2622 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 2622 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 2285 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 75 in 142 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1734, totalLines: 60928, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 2285, elseBlocks: 0, ifBlocks: 2622, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 62472, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 27, unprefixedBooleans: 0 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 152, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 2285 |
| designPatterns | roleFamilies: 91, predictedFiles: 104, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 48, components: 394, orphanComponents: 0, averagePageLines: 47 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 109, limitedColumns: 0, writeDoors: 142, unvalidatedDoors: 75, looserLimits: 0 |
| fileAreas | totalFiles: 2185, backend: 695, frontend: 609, shared: 258, api: 165, tests: 157, tooling: 117, database: 113, docs: 57, infrastructure: 14 |

## Round 7 — the acceptance criterion and blueprint lookups

The gate failed at the start: the ten merges since round 6 (the portal's people, connect, sign-up and organisation switch, the acceptance criterion fix, Waiting on me) had brought duplication from 0 to 0.02%, two clone pairs, each inside one file. That reading was adopted as v11 and committed as the branch's first commit. The plan then held one step, Pass 5, taken. Behaviour is unchanged: `svelte-check` (0 errors with the two public Supabase variables set to any value), all 606 tests and the production build are green.

- **Duplication: 0.02% → 0** (step 1). Two clones:
  - **`acceptanceCriterionActions.ts` 96 → 97**: `set_acceptance_criterion_met` and `delete_acceptance_criterion` each found the reachable task, read its criteria and picked the one named, with the same refusals. They now call `findCriterionOnTask`, shaped like `findChecklistOnTask`, which returns the criterion or the refusal; the old `findCriterion` folded into it. It stays in the actions file rather than a sibling file of its own, because the input validation reading counts every file under `src/lib/server/mcp` that reaches a write as a door, and a new helper file there raised unvalidated doors 75 → 76 without adding a door.
  - **`projectBlueprintActions.ts` 64 → 79**: the three blueprint reads each found the reachable project and read its blueprint. They now call `findBlueprintOfProject`, which returns both or the refusal; each read still says "not read yet" for its own part of the blueprint.
- **Left as it is**: the abbreviation hits rose 17 → 27 with main's tests, all of them `vi.fn()` (the test library's own name) plus the OOXML element names inside the Word builder's XML strings; not ratcheted and not a naming the code chose.
- **Held**: files over the limit 0, worst file 0, functions over the limit 0, else blocks 0, orphans 0, missing predicted files 0, tangled conditions 0, literal comparisons 0, comments 0, member chains 0, deeply indented lines 0, overlong function names 0, accessor names 0, unprefixed booleans 0, magic values 0, input validation looser limits 0 and unvalidated doors 75 of 142 (main's reading; no round sweeps it).
- **Division signature**: none. The round added no files.
- **Put back**: the first cut of step 1 put `findCriterionOnTask` in a file of its own; it raised unvalidated doors by one, so it was folded back into the actions file before the step was committed.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) | v5 (2026-10-10) | v6 (2026-10-11) | v7 (2026-10-12, drift) | v8 (2026-10-12) | v9 (2026-10-13, drift) | v10 (2026-10-13) | v11 (2026-10-17, drift) | v12 (2026-10-17) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | 91.2% | 91.6% | 91.7% | 91.8% | **91.8%** | 91.8% | **91.8%** | 91.8% | **91.8%** |
| Worst file (lines) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Average page length | 54 | 49 | 48 | 48 | 48 | 48 | 48 | **47** | 47 | **47** | 47 | **47** |
| Duplication | 0.42% | 0.19% | 0.26% | 0.26% | 0% | 0% | 0.03% | **0%** | 0.04% | **0%** | 0.02% | **0%** |
| Else blocks | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Functions over the limit | 6 | 4 | 4 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Files over the limit | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Accessor names that want to be a property | — | 32 | 31 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Long member chain lines | 58 | 201 | 200 | 109 | 11 | 7 | 0 | **0** | 0 | **0** | 0 | **0** |
| Deeply indented lines | — | 89 | 81 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Explanatory comment lines | — | 78 | 78 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Overlong function names | — | 2 | 2 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Inline hex colours and styles | — | 5 | 5 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** |
| Inline magic values (repeated literals) | — | — | 30 | 30 | 30 | 30 (66 literals repeated, 699 uses; 67 and 760 at the start) | 2 | **0** | 2 | **0** | 0 | **0** |
| Unprefixed booleans | — | — | — | — | — | — | 4 | **0** | 0 | **0** | 0 | **0** |

## Worst files by length

All 1,734 files are within the limit.

## Next round, named

The new `tools/refactor/refactor-plan.md` is empty: every figure a round can move is at zero, and there is no worst file. The next round holds the gate against whatever main adds. The score's remaining 8.2 points are input validation, which a `fix/` branch moves (*"Run the input validation check"* shows where).
