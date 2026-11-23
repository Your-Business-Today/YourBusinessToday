import { chatMessageLimits } from './chatMessageRules';

/** A move out of the room, as the room it left shows it: one line where the messages were. */
export type MovedAwayMarker = { moveId: string; toRoomId: string; toRoomName: string; moverName: string; messageCount: number; movedAt: string };

/** Where a moved message came from, as the room it went to shows it beneath the message. */
export type MovedHere = { fromRoomName: string; moverName: string };

/** The two kinds of line a room's flow holds. */
export const chatFlowKinds = { message: 'message', movedAway: 'movedAway' } as const;

/** One line of a room, oldest first, at the moment it happened: something said, or the mark of messages moved away. */
export type ChatFlowEntry<Message> =
	| { kind: typeof chatFlowKinds.message; key: string; moment: string; message: Message }
	| { kind: typeof chatFlowKinds.movedAway; key: string; moment: string; marker: MovedAwayMarker };

type Said = { id: string; createdAt: string };

const oneMessage = 1;

/** The line left where messages were: "Moved 3 messages to Finance, by James". */
export function movedAwaySentence(marker: Pick<MovedAwayMarker, 'messageCount' | 'toRoomName' | 'moverName'>): string {
	const noun = marker.messageCount === oneMessage ? 'message' : 'messages';
	return `Moved ${marker.messageCount} ${noun} to ${marker.toRoomName}, by ${marker.moverName}`;
}

/** The small note on a moved message: "moved from General by James". */
export function movedHereNote(movedHere: MovedHere): string {
	return `moved from ${movedHere.fromRoomName} by ${movedHere.moverName}`;
}

function timeOf(moment: string): number {
	return Date.parse(moment);
}

function isBefore(marker: MovedAwayMarker, message: Said): boolean {
	return timeOf(marker.movedAt) < timeOf(message.createdAt);
}

function markersShown<Message extends Said>(messages: Message[], markers: MovedAwayMarker[]): MovedAwayMarker[] {
	const isCutShort = messages.length >= chatMessageLimits.latestMessagesShown;
	const [oldestShown] = messages;
	if (!isCutShort || oldestShown === undefined) return markers;
	return markers.filter((marker) => !isBefore(marker, oldestShown));
}

const messagesFirst = { message: 0, movedAway: 1 } as const;
const sameMoment = 0;

function byMomentThenMessagesFirst<Message extends Said>(first: ChatFlowEntry<Message>, second: ChatFlowEntry<Message>): number {
	const apart = timeOf(first.moment) - timeOf(second.moment);
	if (apart !== sameMoment) return apart;
	return messagesFirst[first.kind] - messagesFirst[second.kind];
}

/**
 * The room's messages with each move out of it placed at the moment it was made, oldest first. A message said at the
 * same moment as a move sits before it. When the room shows only its latest messages, a move older than all of them
 * is left out with the messages it sat among.
 */
export function chatRoomFlow<Message extends Said>(messages: Message[], markers: MovedAwayMarker[]): ChatFlowEntry<Message>[] {
	const messageEntries = messages.map((message): ChatFlowEntry<Message> => ({ kind: chatFlowKinds.message, key: message.id, moment: message.createdAt, message }));
	const markerEntries = markersShown(messages, markers).map(
		(marker): ChatFlowEntry<Message> => ({ kind: chatFlowKinds.movedAway, key: `move-${marker.moveId}`, moment: marker.movedAt, marker })
	);
	return [...messageEntries, ...markerEntries].sort(byMomentThenMessagesFirst);
}

/** The messages of a room's flow alone, in its order. */
export function messagesIn<Message>(flow: ChatFlowEntry<Message>[]): Message[] {
	return flow.flatMap((entry) => (entry.kind === chatFlowKinds.message ? [entry.message] : []));
}
