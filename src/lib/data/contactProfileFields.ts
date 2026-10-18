import { validateChoice } from './choiceRules';

export type Seniority = '' | 'junior' | 'manager' | 'director' | 'executive' | 'owner';

export const seniorityOrder: Seniority[] = ['', 'junior', 'manager', 'director', 'executive', 'owner'];

export const seniorityLabels: Record<Seniority, string> = {
	'': 'Unknown',
	junior: 'Junior',
	manager: 'Manager',
	director: 'Director',
	executive: 'Executive',
	owner: 'Owner or founder'
};

export type Warmth = 'cold' | 'warm' | 'hot';

export const warmthOrder: Warmth[] = ['cold', 'warm', 'hot'];

export const warmthLabels: Record<Warmth, string> = {
	cold: 'Cold',
	warm: 'Warm',
	hot: 'Hot'
};

export function parseSeniority(value: unknown): Seniority {
	const seniority = seniorityOrder.find((candidate) => candidate === value);
	if (seniority === undefined) return '';
	return seniority;
}

export function parseWarmth(value: unknown): Warmth {
	const warmth = warmthOrder.find((candidate) => candidate === value);
	if (warmth === undefined) return 'cold';
	return warmth;
}

/** Why a seniority cannot be stored, or null when it is blank or one of the levels. */
export function validateSeniority(value: unknown): string | null {
	return validateChoice('seniority', value, seniorityOrder);
}

/** Why a warmth cannot be stored, or null when it is left out or one of the warmths. */
export function validateWarmth(value: unknown): string | null {
	return validateChoice('warmth', value, warmthOrder);
}
