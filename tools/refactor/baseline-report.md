# Refactor audit — baseline v26, after round 19

Generated 2026-11-14 from refactor/round-19, replacing the v25 baseline. The gate failed at the round's start: duplication had grown from 0.41% to 0.52% in the work merged since round 18, so that reading was adopted as baseline v25 (adopted from drift: duplication) and the round started from it.

## Headline

Code quality score 99.8% → 99.9%. **Code quality score 99.9%.** **0 of 4,952 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

The designs: the design index is set up (`docs/design/widgets.json`, 8 of the 14 catalogue widgets with a sheet). The widgets were last checked against their sheets on 2026-11-13; the site has never been checked against the brand. *"Check the site against the brand"* and *"Check the widgets against their designs"* (`widget-design`) run them; a round does not.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **99.8%** | **60** | |
| Files over the line limit | 0 in 4952 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 7714 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 7127 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.32 | 98.4% | 8 | 20 |
| Explanatory comment lines | 0 in 188.97 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 188.97 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 8450 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 188.97 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 188.97 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 7714 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 249 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 7127 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 7127 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 7714 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **100.0%** | **8** | |
| Markup written by hand where a widget should be | 0 in 465 widget slots | 100.0% | 8 | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 400 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 4952, totalLines: 188970, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 7714, elseBlocks: 0, ifBlocks: 7127, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 73, duplicatedLines: 616, totalLines: 191880, duplicatedPercentage: 0.32 |
| naming | bannedAbbreviationHits: 90, unprefixedBooleans: 7 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 647, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 7714 |
| designPatterns | roleFamilies: 249, predictedFiles: 249, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, entitiesAccepted: 0, measurementIsHeuristic: True |
| inventory | pages: 80, components: 736, orphanComponents: 0, averagePageLines: 43 |
| siteDefinition | routes: 79, views: 819, siteComponents: 724, catalogue: 14, widgetUsages: 465, handRolledElements: 0, widgetSlots: 465, viewsWithHandRolled: 0, boxedContentWidgets: 0, designSheets: 8, designsLastChecked: 2026-11-13, brandCheckedAt: never |
| inputValidation | schemaTables: 225, limitedColumns: 0, writeDoors: 400, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 5588, backend: 1465, frontend: 1195, shared: 954, tests: 839, api: 649, database: 238, tooling: 149, docs: 79, infrastructure: 20 |

## Round 19 — every repeated function and literal has one home, and the tests share their mocks and fixtures

The plan had four steps: two functions declared word for word in two files, the duplication sweep and four repeated literals. All four were taken. Duplication fell from 0.52% to 0.32%, below round 18's 0.41%, and every other figure held at zero. No behaviour changed and nothing touched the schema.

- **Give `juneDraft` one home**: the validated June map draft, declared in a page test world and a server round-trip test, is now `src/lib/server/workflowMap/juneMap/juneDraft.ts`, beside the June map it validates; both callers import it.
- **Give `lengthRefusal` one home**: the books text-column length refusal, word for word in `bankLineRules.ts` and `bankRuleRules.ts`, is now `src/lib/data/books/textColumn.ts`, beside `moneyColumn.ts`. The business brain's own `lengthRefusal` is a different function (it also refuses a missing value, worded for its fields) and stays where it is.
- **Inline magic values, 4 → 0**: the example link label is `exampleLinkLabel` in `personResearchRules.ts`; the tests now use the existing `workflowMapRequest`; the lead an assumed sentence follows is `assumedLead` in `questionWording.ts`, read by the gap question, the refusal, the action schema and the doctrine; the glossary example word is `exampleGlossaryWord` in `domainExampleWords.ts`, read by the doctrine and the action schema.
- **Duplication 0.52 → 0.32**, test code only:
  - The four loan account test files run their actions as Nigel through `runOnTheLoans` and `idOf` in `booksLoanSteps.fixture.ts`.
  - The five module migration tests read their SQL and check row level security, the shape guard and that nothing is taken away through `src/lib/server/migrations/moduleMigration.fixture.ts`.
  - Twelve brand action tests and mocks modules take the environment and the Jewel organisation from `brandJewelMocks.ts`.
  - Nine books action tests take Your Business Today with the books module on from `booksYourBusinessTodayMocks.ts`.
- **Accepted gaps**: the design pattern reading took the two new mocks modules for a `Mocks`/`Runs` pair and predicted `brandJewelRuns.ts` and `booksYourBusinessTodayRuns.ts`. Neither module runs actions; they only stand in for modules. Both paths are in `designPatterns.acceptedGaps`.
- **Held**: files and functions over the limit, worst file, else blocks, comments, magic values, orphans, member chains, deep indentation, overlong function names (two new fixture names were shortened to five words), tangled and literal conditions, accessor names, predicted files, hand-written widgets, boxed widgets and unvalidated doors all stay at 0.

## The journey so far

| Figure | v23 (2026-11-11, after round 17) | v24 (2026-11-12, after round 18) | v25 (2026-11-14, drift) | v26 (2026-11-14, after round 19) |
| --- | --- | --- | --- | --- |
| Code quality score | 99.4% | 99.8% | 99.8% | **99.9%** |
| Worst file | 0 lines | 0 lines | 0 lines | **0 lines** |
| Average page length | 46 | 44 | 43 | **43** |
| Duplication % | 0.46 | 0.41 | 0.52 | **0.32** |
| Else blocks | 0 | 0 | 0 | **0** |
| Functions over the limit | 0 | 0 | 0 | **0** |
| Files over the limit | 0 | 0 | 0 | **0** |
| Hand-written widget places | 8 in 8 views | 0 | 0 | **0** |
| Repeated literals | 6 | 0 | 4 | **0** |
| Functions repeated word for word | — | — | 2 | **0** |
| Predicted files missing | 0 | 0 | 0 | **0** |

## Worst files by length

No file is over the 100-line limit.

## Next round, named

The plan has one step left: duplication, 0.32% to zero. 70 of its 73 clone pairs are in test files, mostly the per-file mocks of the brand kit, chatbot, gate and books bank line tests. The three outside tests are the shared question-section shape of `domainQuestionsSection.ts` and `mapQuestionsSection.ts` (12 lines), seven lines shared by the boardroom room and seat-control record parsers, and six lines shared by the people register and person research actions. No file is over the limit.
