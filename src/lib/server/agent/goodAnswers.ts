import type { AgendaKind } from './agendaItem';

/** What a good answer to each kind of item looks like, in the person's terms, with the answer_turn outcome that records it. */
export const goodAnswers: Record<AgendaKind, string> = {
	information: 'The answer itself, or the file (answered); or what they will do to get it and by when (promised).',
	setup: 'Done, with where it was set up (answered); or what they will do and by when (promised).',
	testing:
		'Tried it: it works (confirmed) or it fails (failed, with the fault), and the proof either way: a screenshot or what they saw. A failure raises a FIX.',
	task: 'Started or finished, with what was done; or what they will do and by when (promised).',
	promise: 'Done (done); or a day to come back to it (snoozed, with untilDay).',
	todo: 'Done (done); or a day to come back to it (snoozed, with untilDay).',
	chase:
		'Whether to chase them now. If yes, post one message on the oldest item waiting on them with post_message, waitingOn them, never on WhatsApp or by email alone; then snoozed.'
};

/** How long a conversation may go quiet before the agent opens it afresh with what changed. */
export const quietMinutesBeforeOpening = 30;
