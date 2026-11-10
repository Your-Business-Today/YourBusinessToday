import { totalOf } from '$lib/data/taxCalculator/studentLoans';
import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
import { comparisonLabelFor } from '$lib/data/taxCalculator/comparisonLabel';
import type { TradingRouteComparison, TradingRouteTakeHomes } from '$lib/data/taxCalculator/tradingRoutes';
import { takeHomeByRoute } from '$lib/data/taxCalculator/tradingRoutes';
import { readStored, writeStored } from './browserStorage';
import type { RememberedTaxCalculatorForm } from './rememberedTaxCalculatorForm';

export type SavedComparison = {
	id: string;
	label: string;
	savedAt: string;
	grossEarnings: number;
	takeHome: number;
	incomeTax: number;
	nationalInsurance: number;
	studentLoan: number;
	pension: number;
	rememberedForm: RememberedTaxCalculatorForm;
	tradingRoutes?: TradingRouteTakeHomes;
};

const storageKey = 'ybt-take-home-comparisons';
const mostComparisonsKept = 6;

export class SavedComparisons {
	comparisons = $state<SavedComparison[]>([]);

	recall(): void {
		this.comparisons = readStored<SavedComparison[]>('device', storageKey, []);
	}

	save(estimate: TakeHomeEstimate, rememberedForm: RememberedTaxCalculatorForm, routes: TradingRouteComparison): void {
		const comparison: SavedComparison = {
			id: crypto.randomUUID(),
			label: comparisonLabelFor(estimate),
			savedAt: new Date().toISOString(),
			grossEarnings: estimate.grossEarnings,
			takeHome: estimate.takeHome,
			incomeTax: estimate.incomeTaxTotal,
			nationalInsurance: estimate.nationalInsuranceTotal,
			studentLoan: totalOf(estimate.studentLoans),
			pension: estimate.pensionCost,
			rememberedForm,
			tradingRoutes: takeHomeByRoute(routes)
		};
		this.keep([comparison, ...this.comparisons].slice(0, mostComparisonsKept));
	}

	remove(id: string): void {
		this.keep(this.comparisons.filter((comparison) => comparison.id !== id));
	}

	private keep(comparisons: SavedComparison[]): void {
		this.comparisons = comparisons;
		writeStored('device', storageKey, comparisons);
	}
}
