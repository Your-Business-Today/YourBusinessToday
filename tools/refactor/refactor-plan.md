# Refactoring plan

Written by the code quality check at a score of 99.8%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 3 — Utility function identification**

1. Give `juneDraft` one home. The same function, word for word: 5 lines, identical in 2 files: src/lib/components/organisations/workflowMap/tests/juneBeforeAndAfter.ts, src/lib/server/workflowMap/workflowMapRoundTrip.test.ts. Evidence: 0/2 bound from their own markup, 0/2 framework-invoked, 0/2 imported elsewhere.
2. Give `lengthRefusal` one home. The same function, word for word: 5 lines, identical in 2 files: src/lib/data/books/bankLineRules.ts, src/lib/data/books/bankRuleRules.ts. Evidence: 0/2 bound from their own markup, 0/2 framework-invoked, 0/2 imported elsewhere.

**Pass 5 — The sweep to zero**

3. Duplication %: 0.52 to zero. Scores 97.4% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.
4. Inline magic values: 4 to zero. Scores 99.9% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.

## The detail behind the first targets
