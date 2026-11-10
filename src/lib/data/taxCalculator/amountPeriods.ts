export type AmountPeriod = 'annual' | 'quarterly' | 'monthly' | 'weekly';
export const amountPeriods = { annual: 'annual', quarterly: 'quarterly', monthly: 'monthly', weekly: 'weekly' } as const satisfies Record<AmountPeriod, AmountPeriod>;

export const amountPeriodOptions: { period: AmountPeriod; label: string; periodsPerYear: number }[] = [
	{ period: 'annual', label: 'Per year', periodsPerYear: 1 },
	{ period: 'quarterly', label: 'Per quarter', periodsPerYear: 4 },
	{ period: 'monthly', label: 'Per month', periodsPerYear: 12 },
	{ period: 'weekly', label: 'Per week', periodsPerYear: 52 }
];

export function periodsPerYearOf(period: AmountPeriod): number {
	return amountPeriodOptions.find((option) => option.period === period)?.periodsPerYear ?? 1;
}
