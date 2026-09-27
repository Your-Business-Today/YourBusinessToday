export const refactorRoundStoryPoints = 13;

export const refactorRoundBrief = [
	'REFACTOR round — a maintenance round of the repository’s refactor programme, not a feature.',
	'A person’s Claude runs it with the repository’s refactor-round skill',
	'(.claude/skills/refactor-round/SKILL.md) on its own refactor/round-N branch off a fresh default',
	'branch, commits each verified step there, pushes the branch and opens a pull request for the',
	'person to review and merge. Nothing is committed to the default branch.',
	'1. Read the coding rules at the top of CLAUDE.md, then tools/refactor/playbook.md, then the',
	'   skill, and follow the skill exactly. If the repository has no tools/refactor, run the',
	'   project-process bootstrap first.',
	'2. Baseline first: run the audit and the gate against tools/refactor/baseline.json. The report',
	'   you start from is the round’s before. A failing gate means drift: adopt the reading as the',
	'   baseline and say so.',
	'3. Run one extraction round: the worst files over the limit first, behaviour unchanged, the',
	'   repository’s checks green after every step.',
	'4. Baseline last: re-run the audit, copy audit.json over baseline.json, rewrite',
	'   tools/refactor/baseline-report.md in the skill’s shape, push the branch, open the pull request,',
	'   and post the before → after headline and the pull request on this task.',
	'5. Feature freeze: no new behaviour and no schema change. What a change would need, leave and',
	'   name in the report.'
].join('\n');

export function refactorRoundRaisedSentence(deploysSince: number, defaultBranch: string): string {
	return `Raised by the deploy count: ${deploysSince} pushes to ${defaultBranch} since the last round. Run the repository’s refactor-round skill (or its end-of-day script) on its own refactor/round-N branch, open the pull request for review, and post the before → after headline and the pull request here; this task is the round’s record.`;
}
