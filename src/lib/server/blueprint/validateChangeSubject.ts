import {
	changeSubjectFields,
	changeSubjectKinds,
	changeSubjectLimits,
	type ChangeSubject,
	type ChangeSubjectKind
} from '$lib/data/blueprint/changeSubject';

export type ChangeSubjectReading = { subject: ChangeSubject } | { refusal: string };

const knownKinds: ReadonlySet<string> = new Set(Object.values(changeSubjectKinds));

/** What a change is raised from, refused rather than trimmed when it is not one. */
export function validateChangeSubject(formData: FormData): ChangeSubjectReading {
	const kind = String(formData.get(changeSubjectFields.kind) ?? '');
	const name = String(formData.get(changeSubjectFields.name) ?? '').trim();
	if (!knownKinds.has(kind)) return { refusal: 'A change is raised from a screen, an entity, a connector tool, a skill or an agent.' };
	if (name === '') return { refusal: 'Say which screen, entity, tool, skill or agent the change is about.' };
	if (name.length > changeSubjectLimits.nameLength) {
		return { refusal: `The name of what the change is about is at most ${changeSubjectLimits.nameLength} characters.` };
	}
	return { subject: { kind: kind as ChangeSubjectKind, name } };
}
