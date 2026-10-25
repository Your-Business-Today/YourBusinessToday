export const deployWindowOutcomes = {
	opened: 'opened',
	reused: 'reused',
	nothingToPromote: 'nothing_to_promote',
	failed: 'failed'
} as const;

export type DeployWindowOutcome = (typeof deployWindowOutcomes)[keyof typeof deployWindowOutcomes];

/** One day's deploy window on a project: what the promotion did, and the pull request it opened or found. */
export type DeployWindow = {
	projectId: string;
	windowDate: string;
	ranAt: string;
	outcome: DeployWindowOutcome;
	pullRequestUrl: string;
	note: string;
};
