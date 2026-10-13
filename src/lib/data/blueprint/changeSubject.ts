/** What a change is raised from: a screen by its route, an entity, or a connector tool, skill or agent by its name. */
export type ChangeSubject = { kind: ChangeSubjectKind; name: string };

export const changeSubjectKinds = { screen: 'screen', entity: 'entity', tool: 'tool', skill: 'skill', agent: 'agent' } as const;

export type ChangeSubjectKind = (typeof changeSubjectKinds)[keyof typeof changeSubjectKinds];

export const changeSubjectLimits = { nameLength: 200 } as const;

export const changeSubjectFields = { kind: 'subjectKind', name: 'subjectName' } as const;

const subjectPhrases: Record<ChangeSubjectKind, (name: string) => string> = {
	screen: (name) => `the screen ${name} on the site map`,
	entity: (name) => `the entity ${name} in the domain`,
	tool: (name) => `the connector tool ${name} on the MCP map`,
	skill: (name) => `the skill ${name} on the MCP map`,
	agent: (name) => `the agent ${name} on the MCP map`
};

export function describeChangeSubject(subject: ChangeSubject): string {
	return subjectPhrases[subject.kind](subject.name);
}

export function changeSubjectFieldsOf(subject: ChangeSubject): Record<string, string> {
	return { [changeSubjectFields.kind]: subject.kind, [changeSubjectFields.name]: subject.name };
}
