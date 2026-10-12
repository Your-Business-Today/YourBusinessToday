# Refactoring plan

Written by the code quality check at a score of 91.8%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 5 — The sweep to zero**

1. Inline magic values: 2 to zero. Scores 99.8% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.
2. Duplication %: 0.03 to zero. Scores 99.9% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.

## The detail behind the first targets
