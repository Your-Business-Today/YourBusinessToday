import type { ContentStage } from '../content/contentPiece';
import type { PlanMonth } from '../plan/planMonth';

/** A piece as the client was shown it: its id, and when it was last changed as they read it. */
export type PieceAsShown = { contentPieceId: string; updatedAt: string };

/** The month a client approves, and each piece of it they were shown. */
export type MonthApprovalAsked = { month: PlanMonth; pieces: PieceAsShown[] };

export type MonthApprovalCheck = { asked: MonthApprovalAsked } | { problem: string };

/** Why a piece the client was shown is left as it was, rather than approved blind. */
export const LeftReasons = {
	notInMonth: 'not_in_month',
	changedSince: 'changed_since',
	movedOn: 'moved_on',
	takenFirst: 'taken_first'
} as const;

export type LeftReason = (typeof LeftReasons)[keyof typeof LeftReasons];

/** A piece left as it was: which it is, what it is called and goes out on when the plan knows it, and why. */
export type PieceLeft = {
	contentPieceId: string;
	title: string | null;
	medium: string | null;
	stage: ContentStage | null;
	reason: LeftReason;
};

/** Whether a month's approval was refused whole, or given piece by piece. */
export const MonthApprovalKinds = { refused: 'refused', given: 'given' } as const;

/** What a month's approval came to: refused whole, or each piece approved on its own or left with its reason. */
export type MonthApprovalOutcome =
	| { kind: typeof MonthApprovalKinds.refused; problem: string }
	| {
			kind: typeof MonthApprovalKinds.given;
			monthLabel: string;
			approvedCount: number;
			postCount: number;
			awaitingPictureCount: number;
			left: PieceLeft[];
	  };

export type MonthApprovalGiven = Extract<MonthApprovalOutcome, { kind: typeof MonthApprovalKinds.given }>;
