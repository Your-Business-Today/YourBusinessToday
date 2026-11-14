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

/** Where a shot's words sit on the frame. */
export const ShotWordPlaces = { top: 'top', left: 'left', bottom: 'bottom' } as const;

export type ShotWordPlace = (typeof ShotWordPlaces)[keyof typeof ShotWordPlaces];

export const shotWordPlaces: ShotWordPlace[] = Object.values(ShotWordPlaces);

/**
 * One shot: how long it holds, what we see and hear, the library clip or picture it shows, and its words on screen,
 * a small line above, the headline (onScreenText) and a line beneath, sitting at the top, the left or the bottom.
 */
export type StoryboardShot = {
	description: string;
	seconds: number;
	onScreenText: string;
	overline: string;
	underline: string;
	wordsAt: ShotWordPlace;
	clipItemId: string | null;
};

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
	musicItemId: string | null;
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
