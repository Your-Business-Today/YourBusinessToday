import { totalOf } from './studentLoans';
import type { TakeHomeEstimate } from './takeHomeEstimate';

export type SegmentKind = 'takeHome' | 'incomeTax' | 'nationalInsurance' | 'studentLoan' | 'pension';

export type TakeHomeSegment = {
	kind: SegmentKind;
	label: string;
	amount: number;
};

export function takeHomeSegments(estimate: TakeHomeEstimate): TakeHomeSegment[] {
	const segments: TakeHomeSegment[] = [
		{ kind: 'takeHome', label: 'Take-home', amount: Math.max(0, estimate.takeHome) },
		{ kind: 'incomeTax', label: 'Income tax', amount: estimate.incomeTaxTotal },
		{
			kind: 'nationalInsurance',
			label: 'National Insurance',
			amount: estimate.nationalInsuranceTotal
		},
		{ kind: 'studentLoan', label: 'Student loan', amount: totalOf(estimate.studentLoans) },
		{ kind: 'pension', label: 'Pension', amount: estimate.pensionCost }
	];
	return segments.filter((segment) => segment.kind === 'takeHome' || segment.amount > 0);
}
