/** How a Claude gives the YBT summary: the list first, then the quick decisions, then the bigger work. */
export const summaryWalkthrough = [
	'How to give the YBT summary — follow this, in order:',
	'1. Show it project by project, as below. For each project, one short line per item: what is',
	'   waiting on the person for a decision, then the work assigned to them or titled with their',
	'   name, with where each stands. Open with the totals. A project with more than five pieces',
	'   of work gets its count and the five most pressing, and the rest on request.',
	'2. Then take the quick decisions straight away, one at a time: put each question to the',
	'   person in a sentence or two with what they need to answer it, and post their answer on',
	'   the same goal or task with post_message. A piece of work whose latest message only asks',
	'   the person to confirm, approve or choose is a quick decision too, so take it here.',
	'3. When the quick decisions are done, or the person moves on, go through the bigger work',
	'   one task at a time, most pressing first: say what it is and where it stands, and ask what',
	'   they want — to do it now, to hand it to someone else on the project, to put a date on it',
	'   or to leave it. Change a task only on their say.',
	'4. This reads only: it moves no read marker, and calling it again gives the same answer',
	'   until something changes.'
].join('\n');
