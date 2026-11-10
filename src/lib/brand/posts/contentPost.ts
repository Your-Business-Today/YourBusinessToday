import type { ContentPiece } from '../content/contentPiece';

/**
 * A post of the brand's content: one idea, planned once, going out on every channel it has a version for.
 * Each version is a piece of its own, for one medium, with its own caption, approval, schedule and publication.
 * A piece kept before its post could be is a post of its own that is not kept yet.
 */
export type ContentPost = { id: string; channels: ContentPiece[]; isKept: boolean };

/** A channel of a post as a reader is told of it: what it is for, where it stands and its own caption. */
export type PostChannelSummary = Pick<ContentPiece, 'id' | 'mediumPath' | 'stage' | 'caption' | 'scheduledFor' | 'publishedUrl'>;

/** The post a piece belongs to when no post has been kept for it: a post of its own, under the piece's own id. */
export function postOfItsOwn(piece: ContentPiece): ContentPost {
	return { id: piece.id, channels: [piece], isKept: false };
}

export function hasChannel(post: ContentPost, mediumPath: string): boolean {
	return post.channels.some((channel) => channel.mediumPath === mediumPath);
}
