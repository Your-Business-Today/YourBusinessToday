import {
	changeSubjectFields,
	changeSubjectKinds,
	changeSubjectLimits,
	type ChangeSubject,
	type ChangeSubjectKind
} from '$lib/data/blueprint/changeSubject';

export type ChangeSubjectReading = { subject: ChangeSubject } | { refusal: string };

const knownKinds: ReadonlySet<string> = new Set(Object.values(changeSubjectKinds));

/** The screen or entity a change is raised from, refused rather than trimmed when it is not one. */
export function validateChangeSubject(formData: FormData): ChangeSubjectReading {
	const kind = String(formData.get(changeSubjectFields.kind) ?? '');
	const name = String(formData.get(changeSubjectFields.name) ?? '').trim();
	if (!knownKinds.has(kind)) return { refusal: 'A change is raised from a screen or an entity.' };
	if (name === '') return { refusal: 'Say which screen or entity the change is about.' };
	if (name.length > changeSubjectLimits.nameLength) {
		return { refusal: `A screen or entity name is at most ${changeSubjectLimits.nameLength} characters.` };
	}
	return { subject: { kind: kind as ChangeSubjectKind, name } };
}
