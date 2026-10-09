# Refactoring plan

Written by the code quality check at a score of 91.2%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 4 — Design pattern identification**

1. Complete the pattern: every status has a actions. 1 of 4 lack it. Predicted: src/lib/server/projects/updateTaskActions.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
2. Complete the pattern: every status has a record. 1 of 4 lack it. Predicted: src/lib/server/projects/updateTaskRecord.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
3. Complete the pattern: every goal has a project. 2 of 8 lack it. Predicted: src/lib/server/goals/updateProject.ts; src/lib/server/projects/updateTaskProject.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
4. Complete the pattern: every goal has a task. 2 of 8 lack it. Predicted: src/lib/server/goals/updateTask.ts; src/lib/server/projects/updateTaskTask.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
5. Complete the pattern: every +page.svelte has a +page.server.ts. 8 of 33 lack it. Predicted: src/routes/+page.server.ts; src/routes/about/+page.server.ts; src/routes/case-studies/jewel/+page.server.ts; src/routes/company/+page.server.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.

**Pass 5 — The sweep to zero**

6. Long member chain lines: 109 to zero. Scores 90.2% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
7. Inline magic values: 30 to zero. Scores 96.0% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.
8. Duplication %: 0.26 to zero. Scores 98.7% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.

## The detail behind the first targets
