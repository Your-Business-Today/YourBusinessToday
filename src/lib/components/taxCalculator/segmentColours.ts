import type { SegmentKind } from '$lib/data/taxCalculator/takeHomeSegments';

export const segmentStrokeClasses: Record<SegmentKind, string> = {
	takeHome: 'stroke-go',
	incomeTax: 'stroke-lilac',
	nationalInsurance: 'stroke-caution',
	studentLoan: 'stroke-sky',
	pension: 'stroke-etch'
};

export const segmentDotClasses: Record<SegmentKind, string> = {
	takeHome: 'bg-go',
	incomeTax: 'bg-lilac',
	nationalInsurance: 'bg-caution',
	studentLoan: 'bg-sky',
	pension: 'bg-etch'
};
