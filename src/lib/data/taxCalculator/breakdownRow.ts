export type BreakdownRowKind = 'line' | 'detail' | 'subtotal' | 'total';

export type BreakdownRow = {
	label: string;
	amount?: string;
	kind: BreakdownRowKind;
};

export type BreakdownScale = {
	isYearly: boolean;
	of: (annualAmount: number) => number;
};

export function scaleFor(periodsPerYear: number): BreakdownScale {
	return { isYearly: periodsPerYear === 1, of: (annualAmount) => annualAmount / periodsPerYear };
}

export function line(label: string, amount: string): BreakdownRow {
	return { label, amount, kind: 'line' };
}

export function detail(label: string): BreakdownRow {
	return { label, kind: 'detail' };
}

export function subtotal(label: string, amount: string): BreakdownRow {
	return { label, amount, kind: 'subtotal' };
}

export function total(label: string, amount: string): BreakdownRow {
	return { label, amount, kind: 'total' };
}
