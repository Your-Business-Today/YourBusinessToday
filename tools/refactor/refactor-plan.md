# Refactoring plan

Written by the code quality check at a score of 87.7%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 4 — Design pattern identification**

1. Complete the pattern: every status has a actions. 1 of 4 lack it. Predicted: src/lib/server/projects/updateTaskActions.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
2. Complete the pattern: every status has a record. 1 of 4 lack it. Predicted: src/lib/server/projects/updateTaskRecord.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
3. Complete the pattern: every goal has a project. 2 of 8 lack it. Predicted: src/lib/server/goals/updateProject.ts; src/lib/server/projects/updateTaskProject.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
4. Complete the pattern: every goal has a task. 2 of 8 lack it. Predicted: src/lib/server/goals/updateTask.ts; src/lib/server/projects/updateTaskTask.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.

**Pass 5 — The sweep to zero**

5. Accessor names that want to be a property: 32 to zero. Scores 71.5% at weight 6; the offenders are in audit.json under details.accessorNames, fifty at a time.
6. Long member chain lines: 201 to zero. Scores 80.0% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
7. Deeply indented lines: 89 to zero. Scores 91.1% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
8. Conditions with calls tangled inside calls: 25 to zero. Scores 93.2% at weight 8; the offenders are in audit.json under details.conditions, fifty at a time.
9. Inline magic values: 35 to zero. Scores 94.8% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.
10. Explanatory comment lines: 78 to zero. Scores 95.3% at weight 4; the offenders are in audit.json under details.comments, fifty at a time.
11. Overlong function names: 2 to zero. Scores 98.2% at weight 4; the offenders are in audit.json under details.functionNames, fifty at a time.
12. Functions over the line limit: 4 to zero. Scores 98.6% at weight 8; the offenders are in audit.json under details.functionShape, fifty at a time.
13. Duplication %: 0.19 to zero. Scores 99.1% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.

## The detail behind the first targets
