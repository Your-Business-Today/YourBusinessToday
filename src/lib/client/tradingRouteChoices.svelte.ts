import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
import { compareTradingRoutes, type TradingRouteComparison } from '$lib/data/taxCalculator/tradingRoutes';

export type RememberedTradingRouteChoices = { directorSalary: number | null; companyRunningCosts: number | null };

export class TradingRouteChoices {
	directorSalary = $state<number | null>(null);
	companyRunningCosts = $state<number | null>(null);

	get directorSalaryError(): string | null {
		return (this.directorSalary ?? 0) < 0 ? 'A salary can’t be negative.' : null;
	}

	get runningCostsError(): string | null {
		return (this.companyRunningCosts ?? 0) < 0 ? 'Running costs can’t be negative.' : null;
	}

	comparisonFor(estimate: TakeHomeEstimate): TradingRouteComparison {
		const { inputs } = estimate;
		return compareTradingRoutes({
			taxYear: estimate.taxYear,
			taxRegion: inputs.taxRegion,
			income: estimate.grossEarnings,
			directorSalary: this.directorSalary,
			companyRunningCosts: this.companyRunningCosts ?? 0
		});
	}

	remembered(): RememberedTradingRouteChoices {
		return { directorSalary: this.directorSalary, companyRunningCosts: this.companyRunningCosts };
	}

	restore(remembered: RememberedTradingRouteChoices | undefined): void {
		this.directorSalary = remembered?.directorSalary ?? null;
		this.companyRunningCosts = remembered?.companyRunningCosts ?? null;
	}
}
