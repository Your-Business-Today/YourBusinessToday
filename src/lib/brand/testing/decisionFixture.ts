import type { Decision } from '../decisions/decision';
import type { TraitValue } from '../values/traitValue';

export function adoptedDecision(traitKey: string, mediumPath: string, value: TraitValue): Decision {
	return {
		id: `${traitKey}@${mediumPath}`,
		traitKey,
		mediumPath,
		value,
		rationale: '',
		source: 'staff',
		status: 'adopted',
		decidedAt: '2026-09-27T00:00:00Z'
	};
}
