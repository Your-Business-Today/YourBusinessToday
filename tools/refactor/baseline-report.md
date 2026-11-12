# Refactor audit — baseline v24, after round 18

Generated 2026-11-12 from claude/project-thread-v3sx51, replacing the v23 baseline. The gate passed at the round's start, so nothing was adopted from drift.

## Headline

Code quality score 99.5% → 99.8%. **Code quality score 99.8%.** **0 of 3,992 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

The designs: the design index is set up (`docs/design/widgets.json`, 7 of the 13 catalogue widgets with a sheet; InlineField, WorkspaceHeader and BreakdownTable joined the catalogue this round with none). The widgets were last checked against their sheets on 2026-11-10; the site has never been checked against the brand. *"Check the site against the brand"* and *"Check the widgets against their designs"* (`widget-design`) run them; a round does not.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.7%** | **60** | |
| Files over the line limit | 0 in 3992 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 5944 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 5707 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.41 | 98.0% | 8 | 20 |
| Explanatory comment lines | 0 in 149.15 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 149.15 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 6604 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 149.15 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 149.15 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 5944 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 255 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 5707 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 5707 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 5944 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **100.0%** | **8** | |
| Markup written by hand where a widget should be | 0 in 372 widget slots | 100.0% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 339 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 3992, totalLines: 149152, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 5944, elseBlocks: 0, ifBlocks: 5707, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 66, duplicatedLines: 617, totalLines: 151337, duplicatedPercentage: 0.41 |
| naming | bannedAbbreviationHits: 51, unprefixedBooleans: 3 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 373, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 5944 |
| designPatterns | roleFamilies: 215, predictedFiles: 255, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 69, components: 660, orphanComponents: 0, averagePageLines: 44 |
| siteDefinition | routes: 68, views: 732, siteComponents: 649, catalogue: 13, widgetUsages: 372, handRolledElements: 0, widgetSlots: 372, viewsWithHandRolled: 0, boxedContentWidgets: 0, designSheets: 7, designsLastChecked: 2026-11-10, brandCheckedAt: never |
| inputValidation | schemaTables: 198, limitedColumns: 0, writeDoors: 339, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 4592, backend: 1205, frontend: 975, shared: 827, tests: 624, api: 519, database: 207, tooling: 141, docs: 77, infrastructure: 17 |

## Round 18 — the last hand-written widgets are settled, every repeated literal is named once, and the batch filing tests share their mocks

Ten pushes had reached main since round 17, so YBT raised `REFACTOR: round 18` (task b94f0b04). The gate passed at the start (99.5%), and the plan held six steps: four widget adoptions (the places round 17 judged not to be the widget but did not record), the duplication sweep and the magic values sweep. The round took all six in order. The first five are done. Duplication fell from 0.43% to 0.41% and is still a step.

The round added no migration, changed no schema and added no delete. Nothing under `migrations/`, `docs/sql/`, `scripts/` or `.github/workflows/` changed, and nothing in the deploy's machinery in `src`. The seven scripts that load `src/lib` through jiti still resolve every import and reach none of the changed files. The connector offers the same 281 actions (171 writes) and 9 tools as before: every action's summary, guidance and input schema, every tool's description and the whole working doctrine were written down before and after the round and match character for character.

- **Adopt `FormField` in PointsSelect and DeployHistoryFilterBar, and in TaxYearSelect (plan steps 1 and 2)**: these are pickers whose label sits beside the control on one line: the build model row's from and to points, the deploy history's From and To dates, and the calculator header's tax year. FormField draws its label above the control in the brand's field look, so it is not their widget, and adopting it would change how three pages look. The round built **InlineField** (`src/lib/components/site/InlineField.svelte`) from the three copies: the label element, its text and the control beside it. The view keeps its spacing and type (`gap-2 text-xs text-chalk/60` unless it passes its own, which only TaxYearSelect does), so each page renders the same label element with the same classes. InlineField joins `siteDefinition.catalogue`.
- **The honeypot traps in DiscoveryCallForm and DeadlinesEmailCard (plan step 1)**: each is an input out of the tab order inside a hidden label, a trap for bots, not a field anyone fills. The input rule now leaves `tabindex="-1"` alone, as it already leaves hidden, file and range inputs. That covers the class of markup, not the two files.
- **Adopt `PageTitle` in WorkspaceHeader (plan step 3)**: WorkspaceHeader is the header bar of 31 workspace views: breadcrumbs, the title, a badge, actions and tabs. Its h1 is the workspace's own title, smaller than PageTitle. WorkspaceHeader joins the catalogue as a container widget, since it draws the bar (`border-b`, its background), and its h1 is now inside the widget that owns it. No markup changed.
- **Adopt `RecordsTable` in BreakdownTable (plan step 4)**: BreakdownTable is the calculator's statement of lines, details, subtotals and a total, used by five cards. It has no headed columns, sorting or selection, so it is not a records table. It joins the catalogue as the shared widget it already is. No markup changed.
- **Inline magic values: 8 to 0 (plan step 6)**: the three sentences a person says to ask for one thing by name ("set the organisation domain", "set the product domain", "show me everything") are named once in `src/lib/data/personRequests.ts`. The doctrine, the connector's action and tool descriptions and the organisation's Domain page read them from there. The person notes' titles ("Drafted approach", "Found on the web") sit beside the note kinds in `personNoteKind.ts` as `personNoteTitles`, read by the person's description, the two guidance texts and the two saved answers. The promo names its display font once for the scene's four font strings. The task placement test names the sentence it expects once. Three doc comments that quoted a request now describe it.
- **closingDoctrine**: the import added to `workingDoctrine.ts` took it to 101 lines. Its closing rules (7 and 8) moved word for word into `closingDoctrine.ts`, beside the doctrine's other parts (`agentDoctrine`, `askingDoctrine`, `lifecycleDoctrine`, `prospectingDoctrine`). The joined doctrine is unchanged.
- **Duplication sweep (plan step 5)**: the largest clone pair was the two batch filing test files, which each declared the same forty lines: the stand-in brain, five module mocks and the reset between tests. These now live in `businessBrainBatchMocks.ts` and `businessBrainBatchWorld.ts`, the shape the brand tests already use (`brandCampaignMocks` beside `brandCampaignWorld`). The refusals file had declared `newSourcesKept` and never called it; it now imports only what it uses. The same eleven tests run. Duplication went from 0.43 to 0.41.
- **Two accepted gaps**: with a mocks module of its own, batch filing is predicted a `businessBrainBatchActions.ts` and a `businessBrainBatchSchemas.ts`. Batch filing is one action, `file_business_brain_pages`, declared among `businessBrainActions`, and its input schema is the `businessBrainBatchSchema.ts` it already has. Both are in `designPatterns.acceptedGaps`, not empty files.
- **Held**: files and functions over the limit, else blocks, comments, orphans, member chains, deep indentation, overlong names, tangled and literal conditions, predicted files and the input validation doors, all at zero.
- **Division signature**: none. Six files were added. `InlineField.svelte` is the widget for four hand-written copies. `personRequests.ts` is the one home of three sentences quoted 18 times. `closingDoctrine.ts` is a word-for-word move. `businessBrainBatchMocks.ts` and `businessBrainBatchWorld.ts` hold what two test files each declared.

## The journey so far

| Figure | v22 (2026-11-11, drift) | v23 (2026-11-11, after round 17) | start of round 18 (2026-11-12) | v24 (2026-11-12, after round 18) |
| --- | --- | --- | --- | --- |
| Code quality score | 97.8% | 99.4% | 99.5% | **99.8%** |
| Worst file | 0 lines | 0 lines | 0 lines | **0 lines** |
| Average page length | 46 | 46 | 44 | **44** |
| Duplication % | 0.47 | 0.46 | 0.43 | **0.41** |
| Else blocks | 0 | 0 | 0 | **0** |
| Functions over the limit | 0 | 0 | 0 | **0** |
| Files over the limit | 0 | 0 | 0 | **0** |
| Hand-written widget places | 36 in 33 views | 8 in 8 views | 7 in 7 views | **0** |
| Repeated literals | 9 | 6 | 8 | **0** |
| Accessor names that want to be a property | 3 | 0 | 0 | **0** |
| Predicted files missing | 3 | 0 | 0 | **0** |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.

## Next round, named

The plan has one step left: duplication, 0.41% to zero. Of its 66 clone pairs, all but one are in test files. Most are the module mocks each test file declares, the brand mocks modules' shared environment preamble and the migration tests' shared reading of their own SQL; the one outside the tests is seven lines shared by two boardroom record parsers. No file is over the limit.
