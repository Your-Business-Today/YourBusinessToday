# Refactor audit — baseline v5, after round 3

Generated 2026-10-10 from refactor/round-3-73l3g4, replacing the v4 baseline of 2026-10-09 (the end of round 2).

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 91.2% → 91.6%.** **0 of 1,075 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. Duplication is now zero, and long member chains fell from 109 to the 11 the prose check misreads in single-quoted strings. Of the standard baseline checks only inline magic values (30 repeated markup literals) and those 11 lines are short of 100%; what holds the score at 91.6% is input validation, which a round never sweeps.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 1075 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 1325 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 1616 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 38.32 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 30 in 38.32 thousand lines | 96.1% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1605 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 11 in 38.32 thousand lines | 99.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 38.32 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 1325 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 84 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 1616 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1616 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 1325 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 86 in 101 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1075, totalLines: 38320, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 1325, elseBlocks: 0, ifBlocks: 1616, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 39299, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 11, deeplyIndentedLines: 0, overlongLines: 85, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1325 |
| designPatterns | roleFamilies: 56, predictedFiles: 84, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 34, components: 280, orphanComponents: 0, averagePageLines: 48 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 86, limitedColumns: 0, writeDoors: 101, unvalidatedDoors: 86, looserLimits: 0 |
| fileAreas | totalFiles: 1466, frontend: 465, backend: 404, shared: 156, api: 118, tooling: 104, tests: 77, database: 76, docs: 53, infrastructure: 13 |

## Round 3 — the chains and the clones

The gate passed at the start of the round against v4, so no drift was adopted. The plan held three steps, all in Pass 5; the round took them in order. Behaviour is unchanged: `svelte-check`, 333 tests and the production build are green after every step (the build and the typecheck need a `PUBLIC_SUPABASE_URL` in `.env`; with the example file's empty values they fail before any code runs, which is the environment, not this branch).

- **Long member chain lines: 109 → 11** (step 1). Fourteen pages now destructure the records their `data` carries (`const { task, project } = $derived(data)`), so `data.task.title` reads `task.title` and `task={data.task}` becomes `{task}`; the tasks page names the parts of its page of tasks, the kit-versions page the parts of its register, the research page the researched profile and the error page the page's error. `data` and `form` are SvelteKit's, so the local is the right answer there. Where the type was ours it was modelled instead: `ProjectListView` gained `matchCount` (its own `pageCount` and `countLabel` now use it), and task groups gained `groupKeyOf` in `taskTreeGroups.ts`, which the backlog's `{#each}` key and the group's panel id had each written by hand. The profile forms and map panels name the profile, the pin's standing and the area's centre, radius and pins they read; the pin panel's facts became `factsAbout`; the person-events query maps each row with `personEventFrom`; the `who_am_i` answer became `describeAccount`; two DOM handlers became `submitChosenStage` and `chooseUserStory`, after `chooseKind`'s pattern. The 11 that remain are single-quoted string literals — MIME types, `ico.org.uk`, `'client_contacts.people.email'`, `'one.one.one'` in a test — that the prose check reads as chains because it strips double-quoted strings only: a kit finding, left for the kit.
- **Inline magic values: 30, not taken** (step 2). Every one of the 62 literals repeated four times or more is a double-quoted markup attribute (`type="hidden"`, `type="button"`, `class="flex flex-col gap-1"`, `name="personId"`) or a Word style name in `wordStylesXml.ts`; the check lists the top thirty. Naming 700 attribute values as constants would make the markup read worse, which the rules rank below readability. Only a widget catalogue (Pass 1, unmeasured here) takes the class strings out.
- **Duplication: 0.26% → 0** (step 3, eleven clones and the twelfth and thirteenth this round's own renames made in the two profile forms). `ActionsMenu` in the site catalogue holds the button, the outside-click close and the popover both actions menus wrote; `ProjectTileFrame`, `ProjectTilePriority` and `ProjectTileHeading` hold what the two project tiles shared; `CompanyPlaceFields`, `CompanyScaleFields` and `CompanyNarrativeFields` the company profile fields the profile form and the research review both wrote, each form keeping its own website, postcode and name fields in the order it had; `PageMeta` the five public pages' title and Open Graph tags; `findNamedAttachment` the task-and-attachment lookup two MCP actions shared; `readPersonForClaude` with `hasFoundPerson` the Claude check, person and companies the research and approach drafts read; `newTaskRefusal` the story-then-sequence refusal three doors checked; `readContactDetails` the name, email and phone two seed readers parsed.
- **Held**: files over the limit 0, worst file 0, functions over the limit 0, else blocks 0, orphans 0, missing predicted files 0, tangled conditions 0, literal comparisons 0, comments 0, deeply indented lines 0, overlong function names 0, accessor names 0, inline magic values 30, input validation looser limits 0 and unvalidated doors 86 of 101 (main brought the reading from 91 of 98 to 86 of 101 before the round; no round sweeps it).
- **Division signature**: files 1,044 → 1,075 and components 266 → 280, from main's own growth since v4 and the round's twelve new files (eight components, four server modules); design pattern families 55 → 56 and predicted files 82 → 84, all present.
- **Put back**: nothing. No step needed a second attempt.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) | v5 (2026-10-10) |
| --- | --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | 91.2% | **91.6%** |
| Worst file (lines) | 0 | 0 | 0 | 0 | **0** |
| Average page length | 54 | 49 | 48 | 48 | **48** |
| Duplication | 0.42% | 0.19% | 0.26% | 0.26% | **0%** |
| Else blocks | 1 | 0 | 0 | 0 | **0** |
| Functions over the limit | 6 | 4 | 4 | 0 | **0** |
| Files over the limit | 0 | 0 | 0 | 0 | **0** |
| Accessor names that want to be a property | — | 32 | 31 | 0 | **0** |
| Long member chain lines | 58 | 201 | 200 | 109 | **11** |
| Deeply indented lines | — | 89 | 81 | 0 | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | 0 | **0** |
| Explanatory comment lines | — | 78 | 78 | 0 | **0** |
| Overlong function names | — | 2 | 2 | 0 | **0** |
| Inline hex colours and styles | — | 5 | 5 | 0 | **0** |
| Inline magic values (repeated literals) | — | — | 30 | 30 | **30** |

## Worst files by length

All 1,075 files are within the limit.

## Next round, named

The new `tools/refactor/refactor-plan.md` holds two steps, and neither can be finished by a round alone:

1. Inline magic values: 30 to zero — the repeated markup literals. The move that reaches them is naming the widget catalogue in `rules.json` (`siteDefinition.catalogue`: `FormField`, `ActionsMenu`, `PageMeta`, `Modal`, `EmptyState` and the rest of `src/lib/components/site`), so Pass 1 is measured and adoption carries the class strings into the widgets.
2. Long member chain lines: 11 to zero — the kit's prose check should strip single-quoted and template strings as it strips double-quoted ones; with that, the figure reads zero without a code change.
3. Then the sweep is spent, and what holds the score below 100% is input validation (86 of 101 write doors), which is `fix/` work the person asks for ("Run the input validation check" shows where), never a round.

The worst file is still no file: nothing is over the limit.
