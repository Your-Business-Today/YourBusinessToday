import type { Medium } from '../mediums/mediumDefinition';
import type { StoryboardShot } from './contentPiece';

/** A piece as a person's Claude drafts it, every value checked against its column. */
export type ContentDraft = {
	medium: Medium;
	title: string;
	hook: string;
	script: string;
	storyboard: StoryboardShot[];
	caption: string;
	invitedAction: string;
};

export type ContentDraftCheck = { draft: ContentDraft } | { problem: string };
