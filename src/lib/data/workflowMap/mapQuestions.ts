/** Which test of a complete map a question comes from: the four axioms that trace the work, then the lighter checks. */
export const mapQuestionKind = {
	source: 'source',
	destination: 'destination',
	trace: 'trace',
	handover: 'handover',
	role: 'role',
	place: 'place',
	outputs: 'outputs'
} as const;

export type MapQuestionKind = (typeof mapQuestionKind)[keyof typeof mapQuestionKind];

/** Something a filed map leaves missing, as the question that fills it, with the station and the line it is about. */
export type MapQuestion = {
	kind: MapQuestionKind;
	question: string;
	stationKey: string | null;
	stationName: string | null;
	lineKey: string | null;
	lineName: string | null;
};

/** How many of the ranked questions each place shows: the run's walk, and the answer to a filing. */
export const mapQuestionsShown = { inTheWalk: 12, afterFiling: 3 } as const;

/** Each kind of question as the Questions tab names it. */
export const mapQuestionKindNames: Record<MapQuestionKind, string> = {
	source: 'No source',
	destination: 'Goes nowhere',
	trace: 'Not traced to the start',
	handover: 'What goes wrong',
	role: 'One task',
	place: 'Done nowhere named',
	outputs: 'No outputs'
};
