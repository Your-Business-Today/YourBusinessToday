import { ContentStages, type ContentStage } from '../content/contentPiece';

const { idea, drafted, awaitingApproval, approved, scheduled } = ContentStages;

/**
 * The stages a piece may be moved to another day from. Before it is scheduled only the day it is planned for moves;
 * once scheduled, the day it is scheduled for moves with it. A published piece has gone out and stays on its day.
 */
export const ReplanStages = {
	plannedOnly: [idea, drafted, awaitingApproval, approved] as ContentStage[],
	scheduledToo: [scheduled] as ContentStage[]
} as const;

export const ReplanOutcomes = { moved: 'moved', noSuchPiece: 'noSuchPiece', hasGoneOut: 'hasGoneOut' } as const;

export type ReplanOutcome = (typeof ReplanOutcomes)[keyof typeof ReplanOutcomes];

/** Which of the organisation's pieces moves, and the moment it now goes out. */
export type PieceToReplan = { organisationId: string; contentPieceId: string; plannedFor: string };
