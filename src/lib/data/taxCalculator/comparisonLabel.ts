import type { TakeHomeEstimate } from './takeHomeEstimate';
import type { EarningType } from './takeHomeInputs';
import { formatWholePounds } from './taxCalculatorFormatting';

export const earningTypeLabels: Record<EarningType, string> = {
	employed: 'Employed',
	selfEmployed: 'Self-employed',
	both: 'Job + self-employed'
};

export function comparisonLabelFor(estimate: TakeHomeEstimate): string {
	const { inputs } = estimate;
	const region = inputs.taxRegion === 'scotland' ? ' · Scotland' : '';
	return `${earningTypeLabels[inputs.earningType]} · ${formatWholePounds(estimate.grossEarnings)} · ${estimate.taxYear}${region}`;
}
