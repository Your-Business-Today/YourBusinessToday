# Refactoring plan

Written by the code quality check at a score of 88.1%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 4 — Design pattern identification**

1. Complete the pattern: every status has a actions. 1 of 4 lack it. Predicted: src/lib/server/projects/updateTaskActions.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
2. Complete the pattern: every status has a record. 1 of 4 lack it. Predicted: src/lib/server/projects/updateTaskRecord.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
3. Complete the pattern: every goal has a project. 2 of 8 lack it. Predicted: src/lib/server/goals/updateProject.ts; src/lib/server/projects/updateTaskProject.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
4. Complete the pattern: every goal has a task. 2 of 8 lack it. Predicted: src/lib/server/goals/updateTask.ts; src/lib/server/projects/updateTaskTask.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
5. Complete the pattern: every +page.svelte has a +page.server.ts. 8 of 33 lack it. Predicted: src/routes/+page.server.ts; src/routes/about/+page.server.ts; src/routes/case-studies/jewel/+page.server.ts; src/routes/company/+page.server.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.

**Pass 5 — The sweep to zero**

6. Accessor names that want to be a property: 31 to zero. Scores 75.2% at weight 6; the offenders are in audit.json under details.accessorNames, fifty at a time.
7. Long member chain lines: 200 to zero. Scores 81.9% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
8. Deeply indented lines: 81 to zero. Scores 92.7% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
9. Conditions with calls tangled inside calls: 25 to zero. Scores 93.6% at weight 8; the offenders are in audit.json under details.conditions, fifty at a time.
10. Inline magic values: 35 to zero. Scores 95.2% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.
11. Explanatory comment lines: 78 to zero. Scores 95.8% at weight 4; the offenders are in audit.json under details.comments, fifty at a time.
12. Overlong function names: 2 to zero. Scores 98.4% at weight 4; the offenders are in audit.json under details.functionNames, fifty at a time.
13. Functions over the line limit: 4 to zero. Scores 98.7% at weight 8; the offenders are in audit.json under details.functionShape, fifty at a time.
14. Duplication %: 0.26 to zero. Scores 98.7% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.

## The detail behind the first targets
