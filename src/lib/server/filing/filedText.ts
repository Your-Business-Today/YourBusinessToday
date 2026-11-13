import { containsPersonalDetails } from '$lib/data/personalDetailsInText';
import { tooLong, type Refusal } from '$lib/server/portal/portalFormReading';

/** A text value filed through the connector: what the refusal calls it, and the longest its column holds. */
export type TextRule = { field: string; limit: number };

export function isRefused<Value>(reading: Value | Refusal): reading is Refusal {
	return typeof reading === 'object' && reading !== null && 'refusal' in reading;
}

function holdsPersonalDetails(field: string): Refusal {
	return {
		refusal:
			`${field} holds an email address or a phone number. Record the role or the kind of record, ` +
			'never a person, a customer or their details.'
	};
}

export function readOptionalText(value: unknown, rule: TextRule): string | null | Refusal {
	if (value === undefined || value === null) return null;
	if (typeof value !== 'string') return { refusal: `${rule.field} must be text.` };
	const text = value.trim();
	if (text === '') return null;
	if (text.length > rule.limit) return tooLong(rule.field, rule.limit);
	if (containsPersonalDetails(text)) return holdsPersonalDetails(rule.field);
	return text;
}

export function readRequiredText(value: unknown, rule: TextRule): string | Refusal {
	const text = readOptionalText(value, rule);
	if (text === null) return { refusal: `${rule.field} is missing.` };
	return text;
}

export function readChoice<Choice extends string>(
	value: unknown,
	choices: readonly Choice[],
	field: string
): Choice | Refusal {
	const isAChoice = choices.some((choice) => choice === value);
	if (isAChoice) return value as Choice;
	return { refusal: `${field} must be one of: ${choices.join(', ')}.` };
}

export function readList(value: unknown, most: number, field: string): unknown[] | Refusal {
	if (value === undefined || value === null) return [];
	if (!Array.isArray(value)) return { refusal: `${field} must be a list.` };
	if (value.length > most) return { refusal: `${field} holds ${value.length}: keep it to ${most}.` };
	return value;
}

export function fieldsOf(value: unknown): Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
	return value as Record<string, unknown>;
}
