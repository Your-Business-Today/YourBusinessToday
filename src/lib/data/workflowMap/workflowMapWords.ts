import type { MapStage } from './workflowMap';

export const mapStageNames: Record<MapStage, string> = { before: 'Before', after: 'After' };

/** What a person's Claude files on a workflow map and what it never files, said the same wherever it is told. */
export const mapConceptsNotSpecimens =
	'File concepts, not specimens: a line is a role, as a hat someone wears, never a named person; a station is a ' +
	'task, never one job or one customer; what passes is a kind of record, never its contents or figures. An email ' +
	'address or a phone number anywhere is refused.';

/** How a map is read: the words a person's Claude is given before it files one. */
export const mapShapeSentence =
	'A line is a role. Its stations are the tasks that role does, in the order they are done: each with one ' +
	'sentence on it, what it takes in, what it produces and where it is done. A hand-over is one station’s output ' +
	'arriving at a station on another line; where it goes wrong today, say how in one sentence.';
