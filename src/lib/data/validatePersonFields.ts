import { isEmailShaped } from './emailShape';
import { readDay } from './days';
import { parseSeniority, parseWarmth, validateSeniority, validateWarmth, type Seniority, type Warmth } from './contactProfileFields';

/** The fields of a person on the People register as a form or a connector action sends them, each checked against its column. */
export type PersonFieldChanges = {
	name?: string;
	email?: string;
	phone?: string;
	seniority?: Seniority;
	isDecisionMaker?: boolean;
	warmth?: Warmth;
	lastContactedOn?: string | null;
	nextAction?: string;
	nextActionDue?: string | null;
};

export const personFieldRefusals = {
	nameRequired: "A person's name is required.",
	emailNotAnAddress: 'The email is not an email address: give the address they are written to, or leave it out.',
	decisionMakerNotYesOrNo: 'isDecisionMaker is true or false.',
	lastContactedNotADay: 'lastContactedOn is the day we last spoke to them, a real day written YYYY-MM-DD.',
	nextActionDueNotADay: 'nextActionDue is the day the next action is due, a real day written YYYY-MM-DD.'
} as const;

/** The changes as given, each checked against the column it goes to, or a sentence naming the field that does not fit. */
export function validatePersonFields(fields: Record<string, unknown>): PersonFieldChanges | string {
	const changes: PersonFieldChanges = {};
	const refusal =
		readName(fields, changes) ??
		readEmail(fields, changes) ??
		readChoices(fields, changes) ??
		readWhetherTheyDecide(fields, changes) ??
		readDays(fields, changes);
	if (refusal !== null) return refusal;
	if ('phone' in fields) changes.phone = trimmed(fields.phone);
	if ('nextAction' in fields) changes.nextAction = trimmed(fields.nextAction);
	return changes;
}

function readName(fields: Record<string, unknown>, changes: PersonFieldChanges): string | null {
	if (!('name' in fields)) return null;
	const name = trimmed(fields.name);
	if (name === '') return personFieldRefusals.nameRequired;
	changes.name = name;
	return null;
}

function readEmail(fields: Record<string, unknown>, changes: PersonFieldChanges): string | null {
	if (!('email' in fields)) return null;
	const email = trimmed(fields.email).toLowerCase();
	if (email !== '' && !isEmailShaped(email)) return personFieldRefusals.emailNotAnAddress;
	changes.email = email;
	return null;
}

function readChoices(fields: Record<string, unknown>, changes: PersonFieldChanges): string | null {
	if ('seniority' in fields) {
		const refusal = validateSeniority(fields.seniority);
		if (refusal !== null) return refusal;
		changes.seniority = parseSeniority(fields.seniority);
	}
	if (!('warmth' in fields)) return null;
	const refusal = validateWarmth(fields.warmth);
	if (refusal !== null) return refusal;
	changes.warmth = parseWarmth(fields.warmth);
	return null;
}

function readWhetherTheyDecide(fields: Record<string, unknown>, changes: PersonFieldChanges): string | null {
	if (!('isDecisionMaker' in fields)) return null;
	if (typeof fields.isDecisionMaker !== 'boolean') return personFieldRefusals.decisionMakerNotYesOrNo;
	changes.isDecisionMaker = fields.isDecisionMaker;
	return null;
}

function readDays(fields: Record<string, unknown>, changes: PersonFieldChanges): string | null {
	if ('lastContactedOn' in fields) {
		const day = readDay(fields.lastContactedOn);
		if (day === undefined) return personFieldRefusals.lastContactedNotADay;
		changes.lastContactedOn = day;
	}
	if (!('nextActionDue' in fields)) return null;
	const day = readDay(fields.nextActionDue);
	if (day === undefined) return personFieldRefusals.nextActionDueNotADay;
	changes.nextActionDue = day;
	return null;
}

function trimmed(value: unknown): string {
	return String(value ?? '').trim();
}
