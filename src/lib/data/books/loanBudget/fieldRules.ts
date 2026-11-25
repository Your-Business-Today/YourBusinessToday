import { plainTextRefusal } from '../chartRules';
import { validateMoney } from '../moneyColumn';
import { lengthRefusal } from '../textColumn';

export type FieldRule = (candidate: unknown) => string | null;

const nothing = 0;

/** Why the value is not plain text of at most so many characters, or null when it is. */
export function plainTextRule(field: string, longest: number): FieldRule {
	return (candidate) => plainTextRefusal(field, candidate) ?? lengthRefusal(field, candidate as string, longest);
}

/** Why the value is not text, blank allowed, of at most so many characters, or null when it is. */
export function anyTextRule(field: string, longest: number): FieldRule {
	return (candidate) => {
		if (typeof candidate !== 'string') return `${field} is text; ${JSON.stringify(candidate)} was given.`;
		return lengthRefusal(field, candidate, longest);
	};
}

/** Why the value is not an amount in pounds above zero that a numeric(12, 2) column holds, or null when it is. */
export function amountAboveNothingRule(field: string): FieldRule {
	return (candidate) => {
		const amount = validateMoney(field, candidate);
		if (typeof amount === 'string') return amount;
		return amount > nothing ? null : `${field} is above zero; ${candidate} was given.`;
	};
}

/** The given fields checked by their rules: the first refusal, or the fields given with every amount as a number. */
export function checkGivenFields<Settings>(
	fields: Record<string, unknown>,
	rules: Record<keyof Settings, FieldRule>,
	names: (keyof Settings)[]
): Partial<Settings> | string {
	const refusal = names.map((name) => rules[name](fields[name as string])).find((found) => found !== null);
	if (refusal !== undefined) return refusal;
	return Object.fromEntries(names.map((name) => [name, readValue(fields[name as string])])) as Partial<Settings>;
}

/** The setting names a person gave, refused when none was. */
export function givenNames<Settings>(fields: Record<string, unknown>, rules: Record<keyof Settings, FieldRule>): (keyof Settings)[] {
	return (Object.keys(rules) as (keyof Settings)[]).filter((name) => fields[name as string] !== undefined);
}

/** The first setting needed that was left out, or undefined when all were given. */
export function missingField(fields: Record<string, unknown>, required: string[]): string | undefined {
	return required.find((name) => fields[name] === undefined);
}

function readValue(value: unknown): unknown {
	const isWrittenAmount = typeof value === 'string' && /^-?\d+(\.\d{1,2})?$/.test(value);
	return isWrittenAmount ? Number(value) : value;
}
