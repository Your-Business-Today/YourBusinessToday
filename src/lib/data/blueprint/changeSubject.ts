/** What a change raised from the domain or the site map is about: a screen by its route, or an entity by its name. */
export type ChangeSubject = { kind: ChangeSubjectKind; name: string };

export const changeSubjectKinds = { screen: 'screen', entity: 'entity' } as const;

export type ChangeSubjectKind = (typeof changeSubjectKinds)[keyof typeof changeSubjectKinds];

export const changeSubjectLimits = { nameLength: 200 } as const;

export const changeSubjectFields = { kind: 'subjectKind', name: 'subjectName' } as const;

const subjectPhrases: Record<ChangeSubjectKind, (name: string) => string> = {
	screen: (name) => `the screen ${name} on the site map`,
	entity: (name) => `the entity ${name} in the domain`
};

export function describeChangeSubject(subject: ChangeSubject): string {
	return subjectPhrases[subject.kind](subject.name);
}

export function changeSubjectFieldsOf(subject: ChangeSubject): Record<string, string> {
	return { [changeSubjectFields.kind]: subject.kind, [changeSubjectFields.name]: subject.name };
}
