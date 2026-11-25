import { feedEventVerbs, isTaskAssignedEvent, type FeedEventKind } from './feedEventKind';

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
const aClaude = 'A Claude through the connector';

const saidInPlaces: Record<string, string> = { room: 'in' };
const saidOnASubject = 'on';

export function notificationSentence(telling: NotificationTelling): NotificationSentence {
	if (telling.eventKind === null) {
		const preposition = saidInPlaces[telling.subjectKind] ?? saidOnASubject;
		return {
			who: telling.actorName ?? '',
			what: ` said ${preposition} the ${telling.subjectKind} `,
			which: telling.subjectTitle
		};
	}
	if (isTaskAssignedEvent(telling.eventKind)) {
		return { who: telling.actorName ?? aClaude, what: ' gave you the task ', which: telling.subjectTitle };
	}
	return {
		who: telling.actorName ?? mergedPullRequest,
		what: ` ${feedEventVerbs[telling.eventKind]} the task you asked for, `,
		which: telling.subjectTitle
	};
}
