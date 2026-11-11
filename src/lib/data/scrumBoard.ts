import { buildStageLabels, buildStageOrder, type BuildStage } from './buildStage';
import type { LifecycleBadge } from './lifecycleBadge';
import type { Velocity } from './weeklyVelocity';

/** What a card on the Development side is: a bug or a feature built by Claude, or infrastructure set by hand. */
export type WorkKind = 'bug' | 'feature' | 'infrastructure';

export const workKinds = { bug: 'bug', feature: 'feature', infrastructure: 'infrastructure' } as const;

export const workKindLabels: Record<WorkKind, string> = {
	bug: 'Bug',
	feature: 'Feature',
	infrastructure: 'Infrastructure'
};

export type ScrumCard = {
	id: string;
	projectId: string;
	title: string;
	stage: BuildStage;
	workKind: WorkKind;
	storyPoints: number;
	modelLabel: string | null;
	lifecycle: LifecycleBadge | null;
	pullRequestUrl: string;
};

export type ScrumColumn = {
	stage: BuildStage;
	label: string;
	cards: ScrumCard[];
	cardCount: number;
	totalPoints: number;
};

export type ScrumBoard = { columns: ScrumColumn[]; velocity: Velocity };

/** Every column in build order, each with its bugs above everything else and the points it holds. */
export function scrumColumnsOf(cards: ScrumCard[]): ScrumColumn[] {
	return buildStageOrder.map((stage) => columnOf(stage, cards.filter((card) => card.stage === stage)));
}

function columnOf(stage: BuildStage, cards: ScrumCard[]): ScrumColumn {
	return {
		stage,
		label: buildStageLabels[stage],
		cards: bugsAboveTheRest(cards),
		cardCount: cards.length,
		totalPoints: cards.reduce((total, card) => total + card.storyPoints, 0)
	};
}

function bugsAboveTheRest(cards: ScrumCard[]): ScrumCard[] {
	const bugs = cards.filter((card) => card.workKind === workKinds.bug);
	const others = cards.filter((card) => card.workKind !== workKinds.bug);
	return [...bugs, ...others];
}

/** "1 card", "4 cards" */
export function cardCountPhrase(cardCount: number): string {
	const oneCard = 1;
	if (cardCount === oneCard) return '1 card';
	return `${cardCount} cards`;
}
