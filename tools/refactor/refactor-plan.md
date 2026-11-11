# Refactoring plan

Written by the code quality check at a score of 99.4%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 1 — Widget adoption**

1. Adopt `FormField` in 4 file(s) that write its markup by hand. 4 place(s): `src/lib/components/admin/PointsSelect.svelte`, `src/lib/components/contact/DiscoveryCallForm.svelte`, `src/lib/components/organisations/NameDirectorForm.svelte`, `src/lib/components/projects/DeployHistoryFilterBar.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
2. Adopt `FormField` in 2 file(s) that write its markup by hand. 2 place(s): `src/lib/components/taxCalculator/DeadlinesEmailCard.svelte`, `src/lib/components/taxCalculator/TaxYearSelect.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
3. Adopt `PageTitle` in 1 file(s) that write its markup by hand. 1 place(s): `src/lib/components/workspace/WorkspaceHeader.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.
4. Adopt `RecordsTable` in 1 file(s) that write its markup by hand. 1 place(s): `src/lib/components/taxCalculator/BreakdownTable.svelte`. Each is listed with its line in audit.json under details.siteDefinition.offenders.handRolled; the route it reaches is in tools/refactor/site-definition.md.

**Pass 5 — The sweep to zero**

5. Duplication %: 0.46 to zero. Scores 97.7% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.
6. Inline magic values: 6 to zero. Scores 99.8% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.

## The detail behind the first targets
