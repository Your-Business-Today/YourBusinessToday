/** Rules 7 and 8 of the working doctrine: when a refactor round is run, and where the rules are kept in full. */
export const closingDoctrine = [
	'7. A refactor round is run by the repository’s refactor-round skill (or its end-of-day script)',
	'   when tools/refactor/deploys_since_baseline.sh says one is due. Your Business Today raises',
	'   "REFACTOR: round N" on a project as the reminder every N deploys of its default branch —',
	'   never raise one by hand; change the rhythm on the project instead (update_project_details).',
	'   The round follows rule 3 on its own refactor/round-N branch and ends in a pull request.',
	'8. The repository’s CLAUDE.md carries these rules in full. Where it says more, follow it.'
];
