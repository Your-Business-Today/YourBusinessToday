import { ukMeetingTime } from './ukMeetingTime';
import { latestOwnBrief, seatsBriefedOnItem, type BoardBriefWords, type BoardroomBrief, type MeetingBriefing } from './boardroomBrief';
import type { BoardroomDirector } from './boardroomDirector';

const briefIndent = '   ';
const nothingSaid = 'nothing said';

/** The four parts of a brief, a line each, as the director's own Claude reads them back. */
export function briefWordLines(words: BoardBriefWords): string[] {
	return [
		`Your position: ${words.position}`,
		`It may share: ${words.mayShare ?? nothingSaid}`,
		`It must not share: ${words.mustNotShare ?? nothingSaid}`,
		`Must come back to you before it goes further: ${words.mustComeBack ?? nothingSaid}`
	];
}

/** The answer when a brief is kept: which version it is, who reads it, and the brief read back. */
export function briefKept(itemNumber: number, itemTitle: string, version: number, words: BoardBriefWords): string {
	const kept =
		`Your brief on item ${itemNumber}, "${itemTitle}", is kept as version ${version}. Only you and your own Claude read it; ` +
		'the other directors see only that your brief is in.';
	return [kept, '', ...briefWordLines(words)].join('\n');
}

function versionLine(brief: BoardroomBrief): string {
	return `- version ${brief.version}, written ${ukMeetingTime(brief.createdAt)} (UK time)`;
}

/** One version of the reader's own brief on an item, with every version they have written listed beneath. */
export function describeOwnBrief(itemNumber: number, itemTitle: string, brief: BoardroomBrief, versions: BoardroomBrief[]): string {
	const written = ukMeetingTime(brief.createdAt);
	const whichVersion = `version ${brief.version} of ${versions.length}`;
	const heading = `Your brief on item ${itemNumber}, "${itemTitle}": ${whichVersion}, written ${written} (UK time).`;
	const versionLines = ['Every version you have written, latest first:', ...versions.map(versionLine)];
	return [heading, '', ...briefWordLines(brief), '', ...versionLines].join('\n');
}

function briefedName(director: BoardroomDirector, briefing: MeetingBriefing, agendaItemId: string): string {
	const own = latestOwnBrief(briefing, agendaItemId);
	if (director.id !== briefing.seatId || own === null) return director.name;
	return `${director.name} (you, version ${own.version})`;
}

/** Beneath an item on read_board_meeting: whose brief is in and whose is not, and nothing of what any says. */
export function briefLinesOfItem(briefing: MeetingBriefing | undefined, agendaItemId: string, onIt: BoardroomDirector[]): string[] {
	if (briefing === undefined || onIt.length === 0) return [];
	const briefedSeats = seatsBriefedOnItem(briefing, agendaItemId);
	const briefed = onIt.filter((director) => briefedSeats.includes(director.id));
	const awaited = onIt.filter((director) => !briefedSeats.includes(director.id)).map((director) => director.name);
	const briefedNames = briefed.map((director) => briefedName(director, briefing, agendaItemId));
	const briefedWords = briefedNames.join(', ') || 'nobody yet';
	const awaitedWords = awaited.length === 0 ? '' : ` Not yet: ${awaited.join(', ')}.`;
	return [`${briefIndent}- Briefs in: ${briefedWords}.${awaitedWords}`];
}
