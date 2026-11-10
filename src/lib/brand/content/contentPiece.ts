/** Where a piece of a brand's content has got to, from an idea to published. */
export const ContentStages = {
	idea: 'idea',
	drafted: 'drafted',
	awaitingApproval: 'awaiting_approval',
	approved: 'approved',
	scheduled: 'scheduled',
	published: 'published'
} as const;

export type ContentStage = (typeof ContentStages)[keyof typeof ContentStages];

export const contentStages: ContentStage[] = Object.values(ContentStages);

export type StoryboardShot = { description: string; seconds: number; onScreenText: string };

/** The brand as it held for the piece's medium when the piece was drafted. */
export type BrandSnapshot = { brief?: string; variables?: Record<string, string> };

export type ContentSummary = {
	id: string;
	mediumPath: string;
	title: string;
	stage: ContentStage;
	scheduledFor: string | null;
	updatedAt: string;
};

export type ContentPiece = ContentSummary & {
	hook: string;
	script: string;
	storyboard: StoryboardShot[];
	caption: string;
	invitedAction: string;
	publishedUrl: string;
	brandSnapshot: BrandSnapshot;
	plannedFor: string | null;
	kind: string | null;
};

/**
 * A piece as the month's plan lays it out: the post it is a channel of, what it is, its kind of post, its opening line,
 * its caption, and the day it is planned or scheduled for.
 */
export type PlannedPiece = ContentSummary & { postId: string; hook: string; caption: string; plannedFor: string | null; kind: string | null };

export type ContentReview = { verdict: string; body: string; createdAt: string };

export function isContentStage(candidate: string): candidate is ContentStage {
	return (contentStages as string[]).includes(candidate);
}
