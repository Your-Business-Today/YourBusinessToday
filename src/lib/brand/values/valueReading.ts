import type { TraitValue } from './traitValue';

export type ValueReading = { value: TraitValue } | { problem: string };

export function accepted(value: TraitValue): ValueReading {
	return { value };
}

export function refused(problem: string): ValueReading {
	return { problem };
}

export function isRefused(reading: ValueReading): reading is { problem: string } {
	return 'problem' in reading;
}
