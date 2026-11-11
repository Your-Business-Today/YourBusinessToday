# Refactor audit — baseline v23, after round 17

Generated 2026-11-11 from claude/project-thread-u6fgur, replacing the v22 baseline, which the round adopted from drift at its start.

## Headline

Code quality score 97.8% → 99.4%. **Code quality score 99.4%.** **0 of 3,743 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

The designs: the design index is set up (`docs/design/widgets.json`, 7 of 10 catalogue widgets with a sheet). The widgets were last checked against their sheets on 2026-11-10; the site has never been checked against the brand. *"Check the site against the brand"* and *"Check the widgets against their designs"* (`widget-design`) run them; a round does not.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 3743 files | 100.0% | 10 | 50% of files |
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
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 229 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 5459 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 5459 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 5628 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **94.8%** | **8** | |
| Markup written by hand where a widget should be | 8 in 306 widget slots | 94.8% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 312 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 3743, totalLines: 140113, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 5628, elseBlocks: 0, ifBlocks: 5459, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 66, duplicatedLines: 649, totalLines: 142009, duplicatedPercentage: 0.46 |
| naming | bannedAbbreviationHits: 51, unprefixedBooleans: 3 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 6 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 327, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 5628 |
| designPatterns | roleFamilies: 205, predictedFiles: 229, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 64, components: 620, orphanComponents: 0, averagePageLines: 46 |
| siteDefinition | routes: 63, views: 687, siteComponents: 613, catalogue: 10, widgetUsages: 298, handRolledElements: 8, widgetSlots: 306, viewsWithHandRolled: 8, boxedContentWidgets: 0, designSheets: 7, designsLastChecked: 2026-11-10, brandCheckedAt: never |
| inputValidation | schemaTables: 197, limitedColumns: 0, writeDoors: 312, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 4336, backend: 1168, frontend: 909, shared: 788, tests: 558, api: 478, database: 200, tooling: 141, docs: 77, infrastructure: 17 |

## Round 17 — the forms take FormField, five repeated functions get one home, and the gate's six findings are settled

Twenty-six commits had reached main since the baseline of 5 November (8a31083), against a rhythm of ten, so the round was due. The gate failed at the start on drift: three glued accessor names, three predicted files missing, and 0.47% duplication. The round began by adopting that reading as baseline v22 (*adopted from drift*). It then took the plan in order: widget adoption, the five shared functions, the three predicted files, the sweeps, and the three glued names.

The round added no migration, changed no schema and added no delete. Nothing under `migrations/`, `docs/sql/`, `scripts/` or `.github/workflows/` changed, and nothing in the deploy's machinery in `src` (`server/migrations`, `server/migrationRecord`, `server/watch`, `data/deployWindowRule.ts`). The seven scripts that load `src/lib` through jiti all still resolve every import. Only the places loader reaches changed files, and those changes are the two renames below.

- **Adopt `FormField` (plan steps 1–5 and 9)**: 24 labelled fields in 15 files now draw their label through FormField: the area and prospect searches, the organisation's accounts contact, the review model picker, Ask Claude to research, the hand-off pickers, the appointment import, a task's complexity counts and user story fields, and the tax calculator's email, living costs, mileage, home working, pension, student loan and region fields. Each control keeps its name, value, binding, limits and classes. Six ids that only tied a hand-written label to its control went with the label; nothing else referred to them. The conversation composer and the review model form now line their button up with the control's foot (`items-end`), because the label sits above it.
- **How the fields look now**: a control placed directly inside FormField takes the look in `docs/design/widgets/FormField.md` (border, height, padding, background) over the view's own classes. In PensionField and LivingCostsCard the control sits inside an inner span, so it keeps its old look. That difference is for *"Check the widgets against their designs"*.
- **Adopt `PageTitle` (plan steps 6–8)**: the h1 of each public landing section is a hero heading sized for its landing page, not the workspace's PageTitle. That covers about, case study, demo, home, offer, promo, the legal pages, the tax calculator's hero and the contact page. The h1 rule names those files in `unlessGlobs`, as the skill allows for views outside the page layout. `WorkspaceHeader` is left (see *Judged not to be the widget*).
- **The range slider (plan step 9)**: WhatIfCard's input is `type="range"`. FormField would draw a text box's border and height around a slider, so `type="range"` joins the input rule's exempt attributes.
- **Give `parseJson / parsedJsonOrNull` one home**: `src/lib/data/jsonText.ts` holds `parsedJsonOrNull`. The entity manifest reader and the side bar's remembered picks import it.
- **Give `decayingLevel / fadingLevel` one home**: `src/lib/promo/sound/soundEnvelope.ts` holds `decayingLevel` and `silence`, which the drum, effect and tone voices each declared before. The film sounds the same.
- **Give `rowsOfMeeting` one home**: `src/lib/server/boardroom/rowsOfMeeting.ts`, imported by the decisions and minutes readers.
- **Give `meanwhile` one home**: it moved into `booksLedgerCalls.fixture.ts`, beside the `databaseStepStanding` it sets.
- **Give `joineryVersion` one home**: it moved into `companyContextFixtures.ts`, beside `joineryContextInput`.
- **Complete the pattern: every crumbs has an actions**: organisationActions spread the boardroom's eight connector action lists inline. That list moved word for word, in the same order, to `src/lib/server/mcp/actions/boardroomActions.ts`. organisationActions spreads it in the same place, so the connector offers the same actions in the same order.
- **Complete the pattern: every storage has an actions** (accepted gap, `src/lib/client/browserActions.ts`): browserStorage reads and writes a viewer's own conveniences in session and local storage. The browser is not a record anyone acts on, so it has no actions.
- **Complete the pattern: every crumbs has an access** (accepted gap, `src/lib/components/businessBrain/businessBrainAccess.ts`): who reaches Your Business Brain is decided by the module rule every organisation module shares, `requireOrganisationModule` and `canUseOrganisationModule` with `business_brain`. Only the boardroom, whose door is narrowed to its sitting directors, has a rule of its own. A chatbot's reach is read from the database by `readChatbotReach`, beside the brain's other readers.
- **Accessor names that want to be a property: 3 to 0**: `getGroupParents` becomes `listGroupParents`, beside `listClients`. Its file moves to `listGroupParents.ts`, and the two page loads, the four components that import `GroupParent` and the architecture note move with it. `readPlaceRow` becomes `placeSeedOf`, because it turns a row into a seed and reads nothing. `readPlaceIds` becomes `readPlaceIdsInOutcodes`. These are renames with their callers and nothing else: no body changed, and no file re-exports an old name. In `placesWriter.ts`, `upsertPlaces`, `markPlacesGone`, `placeRowOf` and `recordPlacesRun` are unchanged to the character.
- **Duplication sweep**: a decision's answers and the minutes' answers drew the same row word for word. Both now hand it to `DirectorAnswerEntry.svelte`. Duplication went from 0.47 to 0.46. Of the 66 clone pairs left, all but one are in test files, mostly the `vi.mock` blocks each test file has to declare for itself because vitest hoists them. The one outside the tests is seven lines shared by two boardroom record parsers.
- **Magic values sweep**: a records table's sort directions are named once, in `sortDirections`, and the test's customer column key is named. Repeated literals went from 9 to 6. The six left are quotations inside prose: the person's sentence "show me everything" in the connector's doctrine, note titles quoted in sentences, task titles in test answers, and the font name inside the promo's CSS font strings.
- **Judged not to be the widget**: `PointsSelect` (the inline from/to pickers in a build model row, beside unlabelled pill inputs), `NameDirectorForm` (a row editor whose label is for screen readers only), `DeployHistoryFilterBar` (date filters on a search bar), `TaxYearSelect` (the calculator header's year picker), the honeypot traps in `DiscoveryCallForm` and `DeadlinesEmailCard` (a hidden trap, not a field), and `BreakdownTable` (a two-column statement of subtotals and a total, not a records table with headed columns). `WorkspaceHeader`'s h1 is the workspace's own title, smaller than PageTitle. Adopting PageTitle there would change its look, which is a design decision for *"Check the widgets against their designs"*, not for a round.
- **Held**: files and functions over the limit, else blocks, comments, orphans, member chains, deep indentation, overlong names, tangled and literal conditions, and the input validation doors, all at zero.
- **Division signature**: none. Five files were added (`jsonText.ts`, `soundEnvelope.ts`, `rowsOfMeeting.ts`, `DirectorAnswerEntry.svelte`, `boardroomActions.ts`), and each is the one home of code that had been written two or more times.

## The journey so far

| Figure | v21 (2026-11-03, after round 16) | v22 (2026-11-11, drift) | v23 (2026-11-11, after round 17) |
| --- | --- | --- | --- |
| Code quality score | 100.0% | 97.8% | **99.4%** |
| Worst file | 0 lines | 0 lines | **0 lines** |
| Average page length | 45 | 46 | **46** |
| Duplication % | 0 | 0.47 | **0.46** |
| Else blocks | 0 | 0 | **0** |
| Functions over the limit | 0 | 0 | **0** |
| Files over the limit | 0 | 0 | **0** |
| Hand-written widget places | not measured | 36 in 33 views | **8 in 8 views** |
| Repeated literals | 0 | 9 | **6** |
| Accessor names that want to be a property | 0 | 3 | **0** |
| Predicted files missing | 0 | 3 | **0** |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.

## Next round, named

The plan's first four steps are the eight hand-written places this round judged not to be the widget (above). The next round records each judgement or adopts the widget. Then come the duplication in the test files' mock blocks and the six quoted literals. No file is over the limit.
