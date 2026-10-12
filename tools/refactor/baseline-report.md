# Refactor audit — baseline v6, after round 4

Generated 2026-10-11 from refactor/round-4, replacing the v5 baseline of 2026-10-10 (the end of round 3).

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

Adopted from drift on 2026-10-12, at the start of round 5: duplication grew from 0 to 0.03% (two clones, 14 lines) with the client prospecting work merged since round 4, so the gate failed before round 5 touched anything. The reading of that morning became the baseline, and round 5 starts from a green gate.

## Headline

**Code quality score 91.7% → 91.7%.** **0 of 1,167 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. Long member chains fell from 11 to 7, and the markup literals repeated four times or more from 67 kinds in 760 uses to 66 in 699; the magic-value reading lists only the top thirty, so it reads 30 until fewer than thirty kinds repeat. What holds the score at 91.7% is input validation (84 of 113 write doors), which a round never sweeps.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 1167 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 1440 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 1763 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 41.44 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 30 in 41.44 thousand lines | 96.4% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1741 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 7 in 41.44 thousand lines | 99.4% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 41.44 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 1440 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 88 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 1763 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1763 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 1440 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 84 in 113 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1167, totalLines: 41443, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 1440, elseBlocks: 0, ifBlocks: 1763, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 42648, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 7, deeplyIndentedLines: 0, overlongLines: 86, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1440 |
| designPatterns | roleFamilies: 63, predictedFiles: 88, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 36, components: 301, orphanComponents: 0, averagePageLines: 48 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 88, limitedColumns: 0, writeDoors: 113, unvalidatedDoors: 84, looserLimits: 0 |
| fileAreas | totalFiles: 1564, frontend: 490, backend: 438, shared: 170, api: 130, tooling: 105, tests: 85, database: 79, docs: 54, infrastructure: 13 |

## Round 4 — the form fields, the page titles and the MIME types

The kit was brought from 1.17.0 to 1.18.0 as the branch's first commit, at the person's request, so the round measured against the current audit; the update changes only the widget-identification rules, which this repository does not measure (no catalogue). The gate passed at the start against v5 (91.7%, main's growth since round 3 having lifted it from 91.6%), so no drift was adopted. The plan held two steps, both in Pass 5, and the round took them in order. Behaviour is unchanged: `svelte-check`, 371 tests and the production build are green after every step (the typecheck and build need `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` set; any value will do).

- **Inline magic values: 30, held, the uses beneath it cut by 61** (step 1). The repeated literals are markup: HTML's own vocabulary (`type="hidden"`, `type="button"`, `type="submit"`, `rel="noreferrer"`) and Tailwind class strings. Turning attribute values into constants would read worse, so the round took out the repeated class strings that are one concept and gave the concept a component:
  - **SmallCapsField** (`site/SmallCapsField.svelte`, beside `FormField`): the label in small capitals over its control, written by hand in fifty fields across twenty-six files. It takes an optional `class` for the width a row gives it, as `FormField` does. The `labelClasses`, `fieldLabelClasses` and `organisationLabelClasses` copies that only drew those labels went, and so did the `labelClasses` parameter `OrganisationSelect` and `ProjectDatabaseFields` were handed. `class="flex flex-col gap-1"` fell from 59 uses to 17.
  - **fieldClasses, one home**: the field look (`rounded-xl … py-2.5 … focus:border-go`) was declared in sixteen files, as `fieldClasses` in fourteen components and the account styles and as `organisationFieldClasses` in the organisation styles; it now lives in `site/formStyles.ts` beside `inputClasses`, and `OrganisationSelect` and `ProjectDatabaseFields` read it rather than being handed it. `PriorityField` composes it with its width.
  - **PageTitle** (`site/PageTitle.svelte`): the eighteen `<h1 class="font-display text-3xl font-medium">` page titles. Adopting it took the client page to 101 lines, so its heading block — the back link, the title and the stage line — became `clients/ClientHeader.svelte`, after `PersonHeader`'s pattern; the page is 87 lines.
  - Left: `type="hidden"` (67), `type="button"` (66) and the other attribute values are HTML, not magic values, and the layout strings (`flex flex-col gap-4`, `text-xs text-chalk/50`) are utilities each view composes. The check counting double-quoted markup attributes is a kit finding, raised on the Project Process project.
- **Long member chain lines: 11 → 7** (step 2). The Word and spreadsheet MIME types were written out in three files (the attachment rules, the Word document builder and the attachment rules' test); they now live once in `src/lib/data/officeMimeTypes.ts`, and the builder's `wordDocumentContentType` went in favour of it, its download route reading the one home. The task tree test names its tasks `parent`, `child`, `grandchild` and `sibling` rather than `'one.one.one'`. The 7 that remain are text, not chains: the two MIME types in their home, a zip entry path in the Word builder, a Supabase embedded filter (`'client_contacts.people.email'`), GitHub's `application/vnd.github.raw`, and two sentences of prose; the prose check reads single-quoted strings as code. A kit finding, raised with the other.
- **Held**: files over the limit 0, worst file 0, functions over the limit 0, else blocks 0, duplication 0, orphans 0, missing predicted files 0, tangled conditions 0, literal comparisons 0, comments 0, deeply indented lines 0, overlong function names 0, accessor names 0, inline magic values 30, input validation looser limits 0 and unvalidated doors 84 of 113 (main's reading; no round sweeps it).
- **Division signature**: files 1,075 → 1,167 and components 280 → 301, almost all from main's own growth since v5; the round added four files (`SmallCapsField`, `PageTitle`, `ClientHeader`, `officeMimeTypes`).
- **Put back**: nothing. No step needed a second attempt.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) | v5 (2026-10-10) | v6 (2026-10-11) |
| --- | --- | --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | 91.2% | 91.6% | **91.7%** |
| Worst file (lines) | 0 | 0 | 0 | 0 | 0 | **0** |
| Average page length | 54 | 49 | 48 | 48 | 48 | **48** |
| Duplication | 0.42% | 0.19% | 0.26% | 0.26% | 0% | **0%** |
| Else blocks | 1 | 0 | 0 | 0 | 0 | **0** |
| Functions over the limit | 6 | 4 | 4 | 0 | 0 | **0** |
| Files over the limit | 0 | 0 | 0 | 0 | 0 | **0** |
| Accessor names that want to be a property | — | 32 | 31 | 0 | 0 | **0** |
| Long member chain lines | 58 | 201 | 200 | 109 | 11 | **7** |
| Deeply indented lines | — | 89 | 81 | 0 | 0 | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | 0 | 0 | **0** |
| Explanatory comment lines | — | 78 | 78 | 0 | 0 | **0** |
| Overlong function names | — | 2 | 2 | 0 | 0 | **0** |
| Inline hex colours and styles | — | 5 | 5 | 0 | 0 | **0** |
| Inline magic values (repeated literals) | — | — | 30 | 30 | 30 | **30** (66 literals repeated, 699 uses; 67 and 760 at the start) |

## Worst files by length

All 1,167 files are within the limit.

## Next round, named

The new `tools/refactor/refactor-plan.md` holds the same two steps, and neither can be finished by a round alone:

1. Inline magic values: 30 to zero. What repeats now is HTML attribute vocabulary and layout utility strings; the reading moves when the kit stops counting markup attributes, or when a widget catalogue is set up and its widgets take the remaining class strings.
2. Long member chain lines: 7 to zero. All seven are text inside single-quoted strings; the reading moves when the kit's prose check skips string contents.

Every file is within the limit, so there is no worst file.
