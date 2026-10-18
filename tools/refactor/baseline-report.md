# Refactor audit — baseline v16, after round 10

Generated 2026-10-18 from claude/refactor-round-10-ei5ey2, replacing the v15 baseline committed at the end of round 9.

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 96.8% → 100%.** **0 of 1,861 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. The round started from a green gate with every refactoring figure at zero; the 3.2 points left were the 31 write doors that did not check their input against the columns. The repository moved onto project-process kit 1.25.0, whose plan makes each of those a *Close the door* step, and the round closed all 31: unchecked doors 31 of 157 → 0 of 142.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **100.0%** | **60** | |
| Files over the line limit | 0 in 1861 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 2435 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 2777 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0 | 100.0% | 8 | 20 |
| Explanatory comment lines | 0 in 64.99 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 0 in 64.99 thousand lines | 100.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 2852 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 0 in 64.99 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 64.99 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 2435 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 104 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 2777 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 2777 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 2435 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **100.0%** | **8** | |
| Doors that write without checking their input against the columns | 0 in 142 write doors | 100.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1861, totalLines: 64993, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 2435, elseBlocks: 0, ifBlocks: 2777, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 0, duplicatedLines: 0, totalLines: 66593, duplicatedPercentage: 0.0 |
| naming | bannedAbbreviationHits: 28, unprefixedBooleans: 8 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 0 |
| prose | longMemberChainLines: 0, deeplyIndentedLines: 0, overlongLines: 150, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 2435 |
| designPatterns | roleFamilies: 96, predictedFiles: 104, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 48, components: 417, orphanComponents: 0, averagePageLines: 46 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 112, limitedColumns: 0, writeDoors: 142, unvalidatedDoors: 0, looserLimits: 0 |
| fileAreas | totalFiles: 2328, backend: 726, frontend: 632, shared: 280, api: 188, tests: 186, database: 124, tooling: 119, docs: 59, infrastructure: 14 |

## Round 10 — closing the write doors

The kit's *Closing a door* method: each value a caller supplies is checked at the door's gate against its column, refusing only what the column cannot hold; anything the store would have accepted is still accepted. A door the reading misjudged — one that writes nothing its caller supplies — is recorded in `inputValidation.exemptGlobs` rather than given a check it has no use for.

- **Kit 1.23.0 → 1.25.0**: the bootstrap re-run; the plan now carries input-validation steps (31 of them at the start of the round).
- **Fourteen misjudged doors recorded in exemptGlobs**: `resolveMcpCaller.ts` (its only write is its own last-use stamp on the caller's token; the bearer token is only hashed for the lookup), and `actionTypes`, `accountActions`, `batonSentence`, `findMemberOn`, `modelSettingsActions`, `orderingFields`, `queueFields`, `requestedByField`, `serverErrorActions`, `storyFields` and the read-only `clientDetailActions`, which reach that stamp only through the `McpCaller` type; `describeInbox.ts` (it imports the `Inbox` type; the cursor `read_latest_messages` advances is the action's own bookkeeping) and `projects/kit-versions` (its action takes no input; the versions come from GitHub).
- **`describeClient.ts`** stops being a door: the `ClientEvent` types move to `clientEventRecord.ts`, so the read no longer reaches the writer.
- **The three OAuth doors** (`register`, `authorize`, `token`): every value they write is unlimited `text`, so the check is the one thing text cannot hold — a non-string or a NUL character, which used to reach Postgres and end in a 500. Refused with the OAuth error each route already uses, plus `error_description`. `readTokenRequest` no longer coerces a non-string JSON field with `String()`; it is refused.
- **Clients, people, notifications**: the stage is checked against the `lifecycle_stage` check list (the clients page used to turn an unknown stage into *lead*); client, contact, project and notification ids against their uuid columns (`validateRecordId`). The website enquiry's existing check and the officer check gain validator names (`validateWebsiteEnquiry`, `validateOfficerIdentity`), their rules unchanged.
- **Project details** (connector and both web forms): status and database kind against their check constraints, the refactor cadence against its integer check (0 to 2,147,483,647). These used to become *scoping*, *none* and 10, and 2.5 used to become 2; all are now refused by name, and the form gives the cadence the same bounds. One visible change: an empty `refactorEveryDeploys` sent to the connector is refused rather than reset to 10.
- **Attachments and uploads**: the connector's attach path now goes through `validateAttachmentUpload` (filename 1–255, MIME shape, 1 byte to 25 MB); the upload grant's filename and MIME checks (its two check constraints) have one home, `validateUploadDescription`, which `validateAttachmentUpload` reads.
- **Model choice** on the account page: the existing offered-models rule is named `validateModelPreference`, unchanged.
- **Held**: every standard figure at zero, duplication 0%, `looserLimits` 0.
- **Left as found, named for a `fix/` branch** (repairs no column forces, so outside this method): client registration still keeps at most 10 redirect URIs and shortens `client_name` to 200 characters; `publicUrlOr` drops a non-public website or source URL to blank on the enquiry and research forms; unknown headcount bands and seniorities become blank; a malformed `%` escape in Basic credentials still throws a 500.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) | v5 (2026-10-10) | v6 (2026-10-11) | v7 (2026-10-12, drift) | v8 (2026-10-12) | v9 (2026-10-13, drift) | v10 (2026-10-13) | v11 (2026-10-17, drift) | v12 (2026-10-17) | v13 (2026-10-17) | v14 (2026-10-18, drift) | v15 (2026-10-18) | v16 (2026-10-18) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | 91.2% | 91.6% | 91.7% | 91.8% | **91.8%** | 91.8% | **91.8%** | 91.8% | **91.8%** | **91.8%** | 96.8% | **96.8%** | **100%** |
| Worst file (lines) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Average page length | 54 | 49 | 48 | 48 | 48 | 48 | 48 | **47** | 47 | **47** | 47 | **47** | **47** | 46 | **46** | **46** |
| Duplication | 0.42% | 0.19% | 0.26% | 0.26% | 0% | 0% | 0.03% | **0%** | 0.04% | **0%** | 0.02% | **0%** | **0%** | 0.04% | **0%** | **0%** |
| Else blocks | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Functions over the limit | 6 | 4 | 4 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Files over the limit | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Accessor names that want to be a property | — | 32 | 31 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Long member chain lines | 58 | 201 | 200 | 109 | 11 | 7 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Deeply indented lines | — | 89 | 81 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Explanatory comment lines | — | 78 | 78 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Overlong function names | — | 2 | 2 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Inline hex colours and styles | — | 5 | 5 | 0 | 0 | 0 | 0 | **0** | 0 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Inline magic values (repeated literals) | — | — | 30 | 30 | 30 | 30 (66 literals repeated, 699 uses; 67 and 760 at the start) | 2 | **0** | 2 | **0** | 0 | **0** | **0** | 0 | **0** | **0** |
| Unprefixed booleans | — | — | — | — | — | — | 4 | **0** | 0 | **0** | 0 | **0** | **0** | 8 | 8 | 8 |
| Unchecked write doors | — | — | — | — | — | — | — | — | — | — | — | — | 75 of 142 | 31 of 157 | 31 of 157 | **0 of 142** |

## Worst files by length

All 1,861 files are within the limit.

## Next round, named

The new `tools/refactor/refactor-plan.md` is empty: every figure the score counts is at zero, input validation included, and there is no worst file. The next round holds the gate against whatever main adds, closing any new door the same way.
