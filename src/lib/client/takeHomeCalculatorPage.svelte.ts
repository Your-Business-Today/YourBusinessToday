import { readStored, writeStored } from './browserStorage';
import { downloadTextFile } from './downloadFile';
import { rememberForm, restoreForm, type RememberedTaxCalculatorForm } from './rememberedTaxCalculatorForm';
import { SavedComparisons, type SavedComparison } from './savedComparisons.svelte';
import { TaxCalculatorForm } from './taxCalculatorForm.svelte';
import { estimateCsv, estimateCsvFileName } from '$lib/data/taxCalculator/estimateCsv';
import { resultPeriods, type ResultPeriod } from '$lib/data/taxCalculator/resultPeriods';

const formStorageKey = 'ybt-take-home-calculator';
const csvMediaType = 'text/csv';
const exampleLivingCosts = 1800;
const exampleExtraIncome = 5000;

export class TakeHomeCalculatorPage {
	form = new TaxCalculatorForm();
	savedComparisons = new SavedComparisons();
	period = $state<ResultPeriod>(resultPeriods.monthly);
	livingCosts = $state<number | null>(exampleLivingCosts);
	extraIncome = $state(exampleExtraIncome);
	hasRecalledThisVisit = $state(false);

	recall(): void {
		restoreForm(this.form, readStored<RememberedTaxCalculatorForm>('visit', formStorageKey, {}));
		this.savedComparisons.recall();
		this.hasRecalledThisVisit = true;
	}

	rememberForThisVisit(): void {
		const remembered = rememberForm(this.form);
		if (this.hasRecalledThisVisit) writeStored('visit', formStorageKey, remembered);
	}

	keepPeriodAvailable(): void {
		const isQuarterly = this.period === resultPeriods.quarterly;
		if (isQuarterly && !this.form.isSelfEmployed) this.period = resultPeriods.monthly;
	}

	get comparisons(): SavedComparison[] {
		return this.savedComparisons.comparisons;
	}

	removeComparison(comparison: SavedComparison): void {
		this.savedComparisons.remove(comparison.id);
	}

	saveComparison(): void {
		const estimate = this.form.estimate;
		if (!estimate) return;
		const rememberedForm = rememberForm(this.form);
		const routes = this.form.tradingRoutes.comparisonFor(estimate);
		this.savedComparisons.save(estimate, rememberedForm, routes);
	}

	loadComparison(comparison: SavedComparison): void {
		restoreForm(this.form, comparison.rememberedForm);
		document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
	}

	exportEstimate(): void {
		const estimate = this.form.estimate;
		if (!estimate) return;
		downloadTextFile(estimateCsvFileName(estimate), estimateCsv(estimate), csvMediaType);
	}
}
