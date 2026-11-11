/**
 * Where a development task stands in the build, as the Development side's scrum board shows it.
 * The stages are read from what YBT already records, so nobody moves a card by hand.
 */
export type BuildStage = 'backlog' | 'ready' | 'building' | 'inReview' | 'staged' | 'live';

export const buildStages = {
	backlog: 'backlog',
	ready: 'ready',
	building: 'building',
	inReview: 'inReview',
	staged: 'staged',
	live: 'live'
} as const;

export const buildStageOrder: BuildStage[] = [
	buildStages.backlog,
	buildStages.ready,
	buildStages.building,
	buildStages.inReview,
	buildStages.staged,
	buildStages.live
];

export const buildStageLabels: Record<BuildStage, string> = {
	backlog: 'Backlog',
	ready: 'Ready',
	building: 'Building',
	inReview: 'In review',
	staged: 'Staged',
	live: 'Live'
};

/** How long work that has gone live stays on the board before it leaves the Live column. */
export const daysShownLive = 14;

export const buildStageMeanings: Record<BuildStage, string> = {
	backlog: 'not yet considered, or considered and not buildable',
	ready: 'considered buildable, waiting for a model',
	building: 'being built, or built and not yet in review',
	inReview: 'its pull request is open, or it is being reviewed',
	staged: 'merged into staging, not yet live',
	live: `gone live in the last ${daysShownLive} days`
};

const millisecondsInADay = 86_400_000;

/** The earliest moment work can have gone live and still show in the Live column. */
export function shownLiveSince(now: Date): Date {
	return new Date(now.getTime() - daysShownLive * millisecondsInADay);
}
