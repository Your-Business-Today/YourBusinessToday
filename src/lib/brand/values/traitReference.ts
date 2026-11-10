import type { TraitValue } from './traitValue';

const referencePattern = /^\{([a-z]+(?:\.[a-zA-Z0-9]+)+)\}$/;

export function referredTraitKey(value: TraitValue): string | null {
	if (typeof value !== 'string') return null;
	return referencePattern.exec(value)?.[1] ?? null;
}

export function isTraitReference(value: unknown): boolean {
	return typeof value === 'string' && referencePattern.test(value);
}
