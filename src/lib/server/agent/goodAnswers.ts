import type { AgendaKind } from './agendaItem';

/** What a good answer to each kind of item looks like, and how it is recorded once the person says yes to the wording. */
export const goodAnswers: Record<AgendaKind, string> = {
	information:
		'The answer itself, or the file. Post it on the same goal or task with post_message, waitingOn nobody when it settles the ask.',
	setup:
		'Done, with where it was set up; or the day they will do it by, posted with post_message as their promise.',
	testing:
		'Tried it: it works or it fails, with proof (a screenshot, or what they saw). Record it with record_test_results; a failure raises a FIX.',
	task: 'Done (update_task_status), started (post_message with progress started), or the day they will do it by, as their promise.',
	promise: 'Done (complete_todo), or a new day for it (update_todo).',
	todo: 'Done (complete_todo), or a new day for it (update_todo).',
	chase:
		'Whether to chase them now. If yes, post one message on the oldest item waiting on them, waitingOn them; never on WhatsApp or by email alone.'
};

/** How long a conversation may go quiet before the agent opens it afresh with what changed. */
export const quietMinutesBeforeOpening = 30;
