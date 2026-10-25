export const deployWindowOutcomes = {
	opened: 'opened',
	reused: 'reused',
	nothingToPromote: 'nothing_to_promote',
	failed: 'failed'
} as const;

export type DeployWindowOutcome = (typeof deployWindowOutcomes)[keyof typeof deployWindowOutcomes];

/** What set a promotion going: the project's timed window, or a person pressing Deploy now. */
export const deployWindowStarts = { window: 'window', manual: 'manual' } as const;

export type DeployWindowStart = (typeof deployWindowStarts)[keyof typeof deployWindowStarts];

/** One run of a project's promotion: what started it, what it did, and the pull request it opened or found. */
export type DeployWindow = {
	projectId: string;
	windowDate: string;
	ranAt: string;
	startedBy: DeployWindowStart;
	outcome: DeployWindowOutcome;
	pullRequestUrl: string;
	note: string;
};

/** The project's latest run of either kind, for the header, and its latest timed window, for the daily rule. */
export type DeployWindowHistory = { latest: DeployWindow | null; lastTimed: DeployWindow | null };

export const noDeployWindows: DeployWindowHistory = { latest: null, lastTimed: null };

export function isManualDeploy(window: DeployWindow): boolean {
	return window.startedBy === deployWindowStarts.manual;
}
