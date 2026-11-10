import { ContentStages, type ContentStage } from './contentPiece';

/** One step a piece may take on its way to published: the stages it may take it from, and where it lands. */
export type ContentMoveRule = {
	from: ContentStage[];
	to: ContentStage;
	refusal: string;
};

const { idea, drafted, awaitingApproval, approved, scheduled, published } = ContentStages;

/** Every step a piece may take, as yourbrand.today allowed them. Asking for changes sends it back to drafted. */
export const ContentMoves = {
	sendForApproval: {
		from: [idea, drafted],
		to: awaitingApproval,
		refusal: 'Only a drafted piece can be sent for approval'
	},
	approve: {
		from: [awaitingApproval],
		to: approved,
		refusal: 'Only a piece awaiting approval can be approved'
	},
	askForChanges: {
		from: [awaitingApproval],
		to: drafted,
		refusal: 'Only a piece awaiting approval can have changes asked of it'
	},
	schedule: {
		from: [approved, scheduled],
		to: scheduled,
		refusal: 'Only an approved piece can be scheduled'
	},
	recordPublication: {
		from: [approved, scheduled],
		to: published,
		refusal: 'Only an approved or scheduled piece can be recorded as published'
	}
} as const satisfies Record<string, ContentMoveRule>;

/** A step with what it records on the piece: when it goes out, or where it went out. */
export type ContentMove = {
	rule: ContentMoveRule;
	scheduledFor?: string;
	publishedUrl?: string;
};

export function canTakeMove(rule: ContentMoveRule, stage: ContentStage): boolean {
	return rule.from.includes(stage);
}
