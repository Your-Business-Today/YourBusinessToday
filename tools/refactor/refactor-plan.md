# Refactoring plan

Written by the code quality check at a score of 91.6%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 5 — The sweep to zero**

1. Inline magic values: 30 to zero. Scores 96.1% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.
2. Long member chain lines: 11 to zero. Scores 99.0% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.

## The detail behind the first targets
