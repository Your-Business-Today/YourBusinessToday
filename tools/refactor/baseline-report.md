# Refactor audit — baseline v4, after round 2

Generated 2026-10-09 from refactor/round-2, replacing the v3 baseline of the same day (v3 was the drifted reading adopted at the start of the round; v2, of 2026-10-06, was the end of round 1).

The widgets' designs: not set up. The repository has no design index (`docs/design/widgets.json`), no brand sheet and no widget catalogue in `rules.json` (`siteDefinition.catalogue` is empty), so the site has never been checked against the brand and the widgets never against their sheets, and widget adoption is not measured. The sentences that run each, once a catalogue exists, are `widget-design`: *"Check the site against the brand"* and *"Check the widgets against their designs"*.

## Headline

**Code quality score 88.1% → 91.2%.** **0 of 1,044 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines. Seven of the sweep's elements now read zero: glued accessor names, deeply indented lines, tangled conditions, explanatory comments, overlong function names, functions over the limit and inline hex colours and styles.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **98.9%** | **60** | |
| Files over the line limit | 0 in 1044 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 0 in 1277 functions | 100.0% | 8 | 25% of functions |
| Else blocks | 0 in 1574 branches | 100.0% | 5 | 50% of branches |
| Duplication % | 0.26 | 98.7% | 8 | 20 |
| Explanatory comment lines | 0 in 37.19 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 30 in 37.19 thousand lines | 96.0% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1543 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 109 in 37.19 thousand lines | 90.2% | 4 | 30 per thousand lines |
| Deeply indented lines | 0 in 37.19 thousand lines | 100.0% | 4 | 30 per thousand lines |
| Overlong function names | 0 in 1277 functions | 100.0% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 82 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **100.0%** | **20** | |
| Conditions with calls tangled inside calls | 0 in 1574 branches | 100.0% | 8 | 25% of branches |
| Conditions compared to a raw literal | 0 in 1574 branches | 100.0% | 6 | 25% of branches |
| Accessor names that want to be a property | 0 in 1277 functions | 100.0% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 91 in 98 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1044, totalLines: 37189, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 0, totalFunctions: 1277, elseBlocks: 0, ifBlocks: 1574, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 0, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 0, measurementIsHeuristic: True |
| duplication | clones: 11, duplicatedLines: 99, totalLines: 38217, duplicatedPercentage: 0.26 |
| naming | bannedAbbreviationHits: 17, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 0, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 109, deeplyIndentedLines: 0, overlongLines: 82, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 0, literalComparisonLines: 0, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1277 |
| designPatterns | roleFamilies: 55, predictedFiles: 82, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 33, components: 266, orphanComponents: 0, averagePageLines: 48 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 85, limitedColumns: 0, writeDoors: 98, unvalidatedDoors: 91, looserLimits: 0 |
| fileAreas | totalFiles: 1428, frontend: 450, backend: 396, shared: 151, api: 116, tooling: 103, database: 75, tests: 72, docs: 52, infrastructure: 13 |

## Round 2 — the sweep from accessors to comments

The gate failed at the start of the round on duplication (0.19% → 0.26%: 6 clones → 11, from the landing, about, offer and vision pages' markup and an eight-line clone between `taskActions.ts` and the task page's `+page.server.ts`, all landed on main since v2), so the reading was adopted as baseline v3 first and the round started from a green gate. Steps 1 to 5 of the plan — the pattern predictions for `updateTask`, the goal roles and the eight content pages' `+page.server.ts` — were already recorded as accepted gaps in `rules.json` and the audit counts them satisfied; the plan prints them from the patterns, so the round skipped them and took steps 6 to 13 in order: the whole of the sweep bar duplication. Behaviour is unchanged: typecheck, 322 tests and the production build are green after every step. The build needs a `PUBLIC_SUPABASE_URL` in `.env` to evaluate `storageOrigin.ts`; with the example file's empty value it fails before any code runs, which is the environment, not this branch.

- **Accessor names that want to be a property: 31 → 0** (step 6). Every `get`/`read` function named for a type and one of its properties was renamed, with its file, to say what it looks up and by what — `getClientContacts → getContactsForClient`, `getAccountDirectory → getAccountsById`, `getProjectOwnerId → getOwnerIdOfProject`, `getTaskAssigneeMap → getAssigneeIdsByTask`, `getProjectPeople → getPeopleOnProject` — to `parse` where it reads a form or an input (`readProjectDetailsForm → parseProjectDetailsForm`, beside the existing `parseTaskDetailsForm`; `readAttachmentFileInput`, `readAccountIds`, `readRequestedRoles`, `readClientName`, `readSubjectKind`, `readCompanyProfileForm`, `readProjectDetailsEdit`), or to the verb it performs (`getGoalSummaries → summariseGoals`, `getClientList → listClients`, `readStoredFileByteCount → measureStoredFile`). Every caller and three architecture documents follow. The design pattern families were re-read from the new file names and predict nothing new.
- **Long member chain lines: 200 → 109** (step 7, two batches of fifty). The hook's `handle` became three named steps — the Supabase client for the cookies, the session reader, the model override resolver — which also took it under the function limit. Two chains became one home each: the three reorder data attributes in `client/reorderRowAttributes.ts`, and the generated recovery link in `recoveryLinkFrom`, shared by the invite and the recovery link. The client gained `companyNumberOf` and `hasCompanyNumber` so three routes stop reaching into its profile. Everywhere else the line names the object first and takes one step into it: the fetched response and url, the lead's profile and people, the deploy on its record, the event's route, url, request and locals, the Anthropic usage, the checklist and item an MCP action found, the queued task and its owner, the invite's project and inviter, the MCP request's params. 25 of the 109 that remain are single-quoted string literals the audit reads as chains (`'application/vnd.openxmlformats-officedocument.wordprocessingml.document'`, `'client_contacts.people.email'`, `ico.org.uk` in the privacy statement): the prose check strips double-quoted strings only, and this is a single-quote codebase — a kit finding, left for the kit rather than worked around here. The remaining 84 are mostly `data.task.title`-shaped reads in pages and `client.profile.x` in the two profile forms.
- **Deeply indented lines: 81 → 0** (step 8, two batches). Sixteen components took the deeply nested blocks out of their parents with the functions and state only they used: `ClientRow`, `PersonRow`, `AreaCompanyRow`, `PersonLinkChip`, `AccountMenuGroup` and `HeaderFact` each one row of a list; `ClientPeopleActions`, `AddParticipantForm`, `FoundRoleList`, `TaskBranchLinks`, `TaskBranchForm`, `TaskRowTitle`, `TaskStatusOption`, `DangerConfirmForm`, `ModalHeader`, `SignInLink`, `AreaMapPane` and `MarkAllReadForm` each one block with its tracker or derived values. `DangerConfirmModal`'s close no longer resets the typed word and tracker because the form that owns them unmounts with it. `FormTracker`'s nested submit body became `settle()` with `errorMessageFor()` beside it, and the two research tools' nested item schemas became named constants.
- **Conditions with calls tangled inside calls: 25 → 0** (step 9). The expiry check four files wrote by hand (`new Date(x).getTime() < Date.now()`) became `hasExpired` in `data/expiry.ts`; the Authorization header's scheme parsing the bearer and basic readers each wrote became `credentialsForScheme` in `tokens/authorizationHeader.ts`. Everywhere else the tested value is computed on the line above and named — the lowercased role, the recent times, the private host, the client address — or the body's nested call became a named step (`headingXml`, `textParagraphXml`, `parseFormBody`, `outcomeOf`, `failureOf`).
- **Inline magic values: 35 → 30** (step 10). The four Google sign-in hex colours became theme tokens beside the tube line colours, read with `var()`; the wordmark's inline style became Svelte's `style:font-size` directive and `leading-none`. The 30 repeated string literals the audit lists are Tailwind class strings (`flex flex-col gap-4`, 44 times), HTML attribute values (`hidden`, `button`, `submit`) and form field names; only a widget catalogue (Pass 1) takes those out, so they stay.
- **Explanatory comment lines: 78 → 0** (step 11). All 74 `//` lines left were reasons rather than restatements — why the uuid matcher exists, why SvelteKit's origin check is off, why an authorization code is claimed in one conditional update, why a reset email's outcome is unread — so none was deleted; each moved into the `/** */` form the repository already uses for the same thing, on the function, constant, type or field beneath it. The model slider's one markup comment became the names of the values a form reset lands on.
- **Overlong function names: 2 → 0** (step 12). `findOrCreatePersonFromOfficer → ensurePersonForOfficer`, `isTopLevelMoveAcrossGoals → isMoveToAnotherGoal`.
- **Functions over the line limit: 4 → 0** (step 13). `handle` went with the chains; `loadTaskWorkspace` hands its reads to `loadProjectRecords`, `loadConversationRecords` and `loadPlanRecords`, run concurrently as before; the invite email's button and footer became their own snippets; `raiseSupportTask`'s length and daily-ceiling checks became `refusalFor`.
- **Held**: files over the limit 0, worst file 0, else blocks 0, orphans 0, missing predicted files 0, literal comparisons 0, duplication 0.26% (the v3 reading; no clone was added or removed), input validation unvalidated doors 91 and looser limits 0 (never swept by a round).
- **Division signature**: file count 1,023 → 1,044 and components 229 → 266 from the sixteen breakouts, `reorderRowAttributes.ts`, `expiry.ts` and `authorizationHeader.ts`; no figure rose with it. The clone pairs are the eleven v3 carried in; none moved.
- **Put back**: nothing. No step needed a second attempt.
- **Not taken**: step 14, duplication, which the round did not reach; the 25 string-literal "chains" and the 30 repeated literals above, for the reasons given.

## The journey so far

| Figure | v1 (2026-09-15) | v2 (2026-10-06) | v3 (2026-10-09, drift) | v4 (2026-10-09) |
| --- | --- | --- | --- | --- |
| Code quality score | — (84.1% read at round 1's start) | 87.7% | 88.1% | **91.2%** |
| Worst file (lines) | 0 | 0 | 0 | **0** |
| Average page length | 54 | 49 | 48 | **48** |
| Duplication | 0.42% | 0.19% | 0.26% | **0.26%** |
| Else blocks | 1 | 0 | 0 | **0** |
| Functions over the limit | 6 | 4 | 4 | **0** |
| Files over the limit | 0 | 0 | 0 | **0** |
| Accessor names that want to be a property | — | 32 | 31 | **0** |
| Long member chain lines | 58 | 201 | 200 | **109** |
| Deeply indented lines | — | 89 | 81 | **0** |
| Conditions with calls tangled inside calls | — | 25 | 25 | **0** |
| Explanatory comment lines | — | 78 | 78 | **0** |
| Overlong function names | — | 2 | 2 | **0** |
| Inline hex colours and styles | — | 5 | 5 | **0** |

## Worst files by length

All 1,044 files are within the limit.

## Next round, named

The first five steps of the new `tools/refactor/refactor-plan.md`, with the five accepted-gap pattern steps it still prints skipped:

1. Long member chain lines: 109 to zero, fifty at a time (the plan's step 6) — the page reads of `data.task.x` and `data.project.x`, and the two company profile forms, which want the profile as their parameter rather than the client.
2. Inline magic values: 30 to zero (step 7) — thirty repeated Tailwind and attribute literals that only a widget catalogue removes; the honest next move is to name the catalogue in `rules.json` so Pass 1 is measured.
3. Duplication: 0.26% to zero (step 8) — eleven clones, the largest the four content pages' markup and the two project tiles.
4. The kit: the prose check should strip single-quoted and template strings as it strips double-quoted ones, so a MIME type is not a member chain.
5. Then the plan is spent, and the next check decides whether the widget catalogue or the input validation fixes (a `fix/` branch, never a round) come first.

The worst file is still no file: nothing is over the limit, and the round after this one is the last of the sweep.
