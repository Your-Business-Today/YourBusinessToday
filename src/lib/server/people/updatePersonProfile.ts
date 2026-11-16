import type { SupabaseClient } from '@supabase/supabase-js';
import { parseSeniority, parseWarmth } from '$lib/data/contactProfileFields';
import { toPersonProfileColumns, type Person, type PersonProfile } from './personRecord';

const duplicateRowCode = '23505';

export type PersonProfileSave = 'saved' | 'email_taken';

export const personProfileSaves = { saved: 'saved', emailTaken: 'email_taken' } as const;

export type PersonProfileEdit = PersonProfile & {
	name: string;
	email: string;
	phone: string;
};

export function readPersonProfileEdit(formData: FormData): PersonProfileEdit | null {
	const name = readTrimmed(formData, 'name');
	if (name === '') return null;
	return {
		name,
		email: readTrimmed(formData, 'email').toLowerCase(),
		phone: readTrimmed(formData, 'phone'),
		seniority: parseSeniority(formData.get('seniority')),
		isDecisionMaker: formData.get('isDecisionMaker') === 'on',
		warmth: parseWarmth(formData.get('warmth')),
		lastContactedOn: readDate(formData, 'lastContactedOn'),
		nextAction: readTrimmed(formData, 'nextAction'),
		nextActionDue: readDate(formData, 'nextActionDue')
	};
}

/**
 * An email address names one person, so an edit onto an address another
 * person already holds is refused rather than raised as a database error.
 */
export async function updatePersonProfile(
	supabase: SupabaseClient,
	personId: string,
	edit: PersonProfileEdit
): Promise<PersonProfileSave> {
	const { error } = await supabase
		.from('people')
		.update({
			name: edit.name,
			email: edit.email,
			phone: edit.phone,
			updated_at: new Date().toISOString(),
			...toPersonProfileColumns(edit)
		})
		.eq('id', personId);
	if (error !== null && error.code === duplicateRowCode) return 'email_taken';
	if (error) throw error;
	return 'saved';
}

/** A person as an edit of their profile starts from: everything they hold now. */
export function profileEditOf(person: Person): PersonProfileEdit {
	return {
		name: person.name,
		email: person.email,
		phone: person.phone,
		seniority: person.seniority,
		isDecisionMaker: person.isDecisionMaker,
		warmth: person.warmth,
		lastContactedOn: person.lastContactedOn,
		nextAction: person.nextAction,
		nextActionDue: person.nextActionDue
	};
}

function readTrimmed(formData: FormData, field: string): string {
	return String(formData.get(field) ?? '').trim();
}

function readDate(formData: FormData, field: string): string | null {
	const value = readTrimmed(formData, field);
	if (value === '') return null;
	return value;
}
