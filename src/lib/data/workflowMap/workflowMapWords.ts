import type { LineKind, MapStage } from './workflowMap';

export const mapStageNames: Record<MapStage, string> = { before: 'Before', after: 'After' };

/** What a line's kind is called on a page, beside the line's name. */
export const lineKindNames: Record<LineKind, string> = { role: 'Role', outside_party: 'Outside party', system: 'System' };

/** What a line's kind is called in a sentence: "Client's staff, an outside party". */
export const lineKindPhrases: Record<LineKind, string> = { role: 'a role', outside_party: 'an outside party', system: 'a system' };

/** How a station panel says where something arriving from outside comes from: "Arrives from a customer". */
export function arrivesFromSentence(arrivesFrom: string): string {
	return `Arrives from ${arrivesFrom}`;
}

/** What a person's Claude files on a workflow map and what it never files, said the same wherever it is told. */
export const mapConceptsNotSpecimens =
	'File concepts, not specimens: a line is a role, an outside party or a system, never a named person; a station is a ' +
	'task, never one job or one customer; what passes is a kind of record, never its contents or figures. An email ' +
	'address or a phone number anywhere is refused.';

/** How a map is read: the words a person's Claude is given before it files one. */
export const mapShapeSentence =
	'A line is a role, as a hat someone wears in the business; an outside party, such as a customer, a supplier or a ' +
	'regulator; or a system the work runs through. Give each line its kind. Its stations are the tasks that line does, ' +
	'in the order they are done: each with one sentence on it, what it takes in, what it produces and where it is done. ' +
	'A hand-over is one station’s output arriving at a station on another line; where it goes wrong today, say how in ' +
	'one sentence. An arrival is what comes from outside the map to start a station’s work, with who or what it arrives ' +
	'from, such as a customer or the calendar on the first of the month.';
