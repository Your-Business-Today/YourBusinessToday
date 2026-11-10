# Refactoring plan

Written by the code quality check at a score of 96.5%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 1 — Widget adoption**

1. Adopt `FormField` in 4 file(s) that write its markup by hand. 7 place(s): `src/lib/components/clients/map/AreaSearchForm.svelte` (3), `src/lib/components/organisations/OrganisationDetailsFields.svelte` (2), `src/lib/components/admin/PointsSelect.svelte`, `src/lib/components/admin/ReviewModelForm.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
2. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/clients/AskClaudeToResearch.svelte`, `src/lib/components/clients/ProspectSearchForm.svelte`, `src/lib/components/contact/DiscoveryCallForm.svelte`, `src/lib/components/conversations/HandOffPicker.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
3. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/organisations/NameDirectorForm.svelte`, `src/lib/components/people/AppointmentImportForm.svelte`, `src/lib/components/projects/DeployHistoryFilterBar.svelte`, `src/lib/components/projects/TaskComplexityCount.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
4. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/projects/UserStoryFields.svelte`, `src/lib/components/taxCalculator/LivingCostsCard.svelte`, `src/lib/components/taxCalculator/MileageAndHomeFields.svelte`, `src/lib/components/taxCalculator/PensionField.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
5. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/taxCalculator/StudentLoanFields.svelte`, `src/lib/components/taxCalculator/TaxRegionField.svelte`, `src/lib/components/taxCalculator/TaxYearSelect.svelte`, `src/lib/components/taxCalculator/WhatIfCard.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
6. Adopt `PageTitle` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/about/AboutStorySection.svelte`, `src/lib/components/case-study/CaseStudyIntroSection.svelte`, `src/lib/components/demo/DemoConnectSection.svelte`, `src/lib/components/demo/DemoStartSection.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
7. Adopt `PageTitle` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/home/HeroSection.svelte`, `src/lib/components/offer/OfferStepsSection.svelte`, `src/lib/components/promo/PromoIntro.svelte`, `src/lib/components/site/LegalArticle.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
8. Adopt `PageTitle` in 3 file(s) that write its markup by hand. 3 place(s): `src/lib/components/taxCalculator/CalculatorHero.svelte`, `src/lib/components/workspace/WorkspaceHeader.svelte`, `src/routes/contact/+page.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
9. Build, from the best of these, then adopt `RecordsTable` in 1 file(s) that write its markup by hand. 1 place(s): `src/lib/components/taxCalculator/BreakdownTable.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.

**Pass 3 — Utility function identification**

10. Give `decayingLevel / fadingLevel` one home. The same function, word for word: 6 lines, identical in 2 files: src/lib/promo/sound/drumVoices.ts, src/lib/promo/sound/effectVoices.ts. Evidence: 0/2 bound from their own markup, 0/2 framework-invoked, 0/2 imported elsewhere.
11. Give `joineryVersion` one home. The same function, word for word: 5 lines, identical in 2 files: src/lib/server/mcp/actions/describeCompanyContext.test.ts, src/lib/server/mcp/actions/describeContextRun.test.ts. Evidence: 0/2 bound from their own markup, 0/2 framework-invoked, 0/2 imported elsewhere.

**Pass 4 — Design pattern identification**

12. Complete the pattern: every storage has a actions. 1 of 4 lack it. Predicted: src/lib/client/browserActions.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
13. Complete the pattern: every storage has a record. 1 of 4 lack it. Predicted: src/lib/client/browserRecord.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.

**Pass 5 — The sweep to zero**

14. Accessor names that want to be a property: 3 to zero. Scores 99.3% at weight 6; the offenders are in audit.json under details.accessorNames, fifty at a time.
15. Inline magic values: 6 to zero. Scores 99.7% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.

## The detail behind the first targets
