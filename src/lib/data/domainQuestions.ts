/** Which statement of a complete domain a question comes from, each failing in its own way. */
export const domainQuestionKind = {
	phrase: 'phrase',
	word: 'word',
	identity: 'identity',
	status: 'status',
	event: 'event',
	ruleKind: 'ruleKind',
	gate: 'gate',
	whenever: 'whenever',
	relationship: 'relationship',
	assumed: 'assumed'
} as const;

export type DomainQuestionKind = (typeof domainQuestionKind)[keyof typeof domainQuestionKind];

/** What a question is about: its name, and the thing or the page it opens, when the domain holds one. */
export type DomainQuestionSubject = { about: string; thingSlug: string | null; pageId: string | null };

/** Something the domain leaves missing, as the question that fills it, with what it is about and the area it is in. */
export type DomainQuestion = DomainQuestionSubject & {
	kind: DomainQuestionKind;
	question: string;
	areaSlug: string | null;
	areaTitle: string | null;
};

/** How many of the ranked questions each place shows: the run's walk, and the answer to a filing. */
export const domainQuestionsShown = { inTheWalk: 12, afterFiling: 3 } as const;

/** The statement of a complete domain each kind tests, in the order they are asked. */
export const domainQuestionStatements: Record<DomainQuestionKind, number> = {
	phrase: 5,
	word: 5,
	identity: 6,
	status: 6,
	event: 7,
	ruleKind: 8,
	gate: 8,
	whenever: 8,
	relationship: 9,
	assumed: 10
};

/** Each kind of question as the Questions tab names it. */
export const domainQuestionKindNames: Record<DomainQuestionKind, string> = {
	phrase: 'Not a word',
	word: 'Names nothing',
	identity: 'What makes one',
	status: 'Reached by no task',
	event: 'Hand-over with no event',
	ruleKind: 'Rule with no kind',
	gate: 'Stops no task',
	whenever: 'Follows no event',
	relationship: 'Areas not related',
	assumed: 'Assumed'
};
