import { feedEventVerbs, type FeedEventKind } from './feedEventKind';

/** The parts of a bell notification its sentence is built from. */
export type NotificationTelling = {
	subjectKind: string;
	subjectTitle: string;
	eventKind: FeedEventKind | null;
	actorName: string | null;
};

/** The sentence as three parts, so the names can be set in a heavier face: who, what, which. */
export type NotificationSentence = { who: string; what: string; which: string };

const mergedPullRequest = 'A merged pull request';

export function notificationSentence(telling: NotificationTelling): NotificationSentence {
	if (telling.eventKind === null) {
		return {
			who: telling.actorName ?? '',
			what: ` said on the ${telling.subjectKind} `,
			which: telling.subjectTitle
		};
	}
	return {
		who: telling.actorName ?? mergedPullRequest,
		what: ` ${feedEventVerbs[telling.eventKind]} the task you asked for, `,
		which: telling.subjectTitle
	};
}
