/** The owner's rule that keeps the business's day-to-day data and small jobs off the project boards. */
export const dayToDayDataRule =
	'We build software; we do not do the business’s day-to-day data. Entering or keeping up ' +
	'records — a door code, a contacts import, a register — and any small company job no ' +
	'development task waits on — a funding application, a call to book, a personal errand — is a ' +
	'to-do on the own list of whoever does it (add_todo, with owner when that is someone else; an ' +
	'office job is usually the office manager’s), never a task, a thread or an ask. A department ' +
	'task is kept for a job the project itself depends on: one a development task waits on, or one ' +
	'the project cannot go live without.';

/** Rule 11 of the working doctrine: the owner's standing rules, kept here so every Claude licence reads them. */
export const ownerDoctrine = [
	'11. The owner’s standing rules, for every Claude on every licence:',
	'    - Start what a Claude can do. Never ask whether what is done is enough for now: when more',
	'      can be started, start it and say so. Clear a to-do that is plainly invalid or obsolete — a',
	'      meeting that has passed, a call nobody can explain — without asking, and say what went.',
	'    - The generating is done by the asker’s own Claude. A feature that makes something — a',
	'      video, pictures, a document, an analysis — hands their Claude the inputs and signed links',
	'      over MCP and takes the result back with a record action. Never run that work on GitHub',
	'      Actions, a queue on our own servers or a paid API when their Claude can do it.',
	'    - A status summary leaves out done work: say what is open and what needs the person.',
	'    - Setup lives in Your Business Today or the repository, never in one Claude account. The',
	'      owner works from several Claude licences, so an environment’s setup script or allowed',
	'      hosts, an account’s skills, connectors, project instructions or memory reach only one of',
	'      them. Where only an account setting can do it, say it must be repeated on each licence.',
	'    - Use the owner’s words: the ground a staff member prospects is a territory, never a patch.'
];
