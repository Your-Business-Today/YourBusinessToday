import { estimateTakeHome, type TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
import type { EarningType, TakeHomeInputs, TradingStatus, VehicleType } from '$lib/data/taxCalculator/takeHomeInputs';
import { currentTaxYear } from '$lib/data/taxCalculator/taxYearRules';
import type { HomeWorkingBand, TaxRegion, TaxYearName, UndergraduateLoanPlan } from '$lib/data/taxCalculator/taxRuleTypes';
import { PeriodAmount } from './periodAmount.svelte';

const exampleSalary = 45000;

export class TaxCalculatorForm {
	taxYear = $state<TaxYearName>(currentTaxYear(new Date()));
	taxRegion = $state<TaxRegion>('restOfUk');
	earningType = $state<EarningType>('employed');
	salary = new PeriodAmount(exampleSalary);
	bonus = new PeriodAmount();
	selfEmploymentIncome = new PeriodAmount();
	expenses = new PeriodAmount();
	cisDeductions = new PeriodAmount();
	businessMiles = new PeriodAmount();
	tradingStatus = $state<TradingStatus>('soleTrader');
	vehicleType = $state<VehicleType>('none');
	homeWorkingBand = $state<HomeWorkingBand>('under25Hours');
	pensionPercentage = $state<number | null>(null);
	undergraduatePlan = $state<UndergraduateLoanPlan | null>(null);
	hasPostgraduateLoan = $state(false);

	get isEmployed(): boolean {
		return this.earningType !== 'selfEmployed';
	}

	get isSelfEmployed(): boolean {
		return this.earningType !== 'employed';
	}

	get amounts(): PeriodAmount[] {
		return [this.salary, this.bonus, this.selfEmploymentIncome, this.expenses, this.cisDeductions, this.businessMiles];
	}

	get hasIncome(): boolean {
		const hasPay = this.isEmployed && this.salary.hasAmount;
		return hasPay || (this.isSelfEmployed && this.selfEmploymentIncome.hasAmount);
	}

	get inputs(): TakeHomeInputs {
		return {
			taxYear: this.taxYear,
			taxRegion: this.taxRegion,
			earningType: this.earningType,
			annualSalary: this.salary.annualAmount,
			annualBonus: this.bonus.annualAmount,
			pensionPercentage: Math.min(100, Math.max(0, this.pensionPercentage ?? 0)),
			studentLoans: { undergraduatePlan: this.undergraduatePlan, hasPostgraduateLoan: this.hasPostgraduateLoan },
			selfEmployment: {
				tradingStatus: this.tradingStatus,
				annualIncome: this.selfEmploymentIncome.annualAmount,
				annualExpenses: this.expenses.annualAmount,
				annualCisDeductions: this.cisDeductions.annualAmount,
				annualBusinessMiles: this.businessMiles.annualAmount,
				vehicleType: this.vehicleType,
				homeWorkingBand: this.homeWorkingBand
			}
		};
	}

	get estimate(): TakeHomeEstimate | null {
		const hasErrors = this.amounts.some((periodAmount) => periodAmount.errorMessage !== null);
		if (hasErrors || !this.hasIncome) return null;
		return estimateTakeHome(this.inputs);
	}

	chooseEarningType(earningType: EarningType): void {
		const isFirstTimeSelfEmployed = earningType === 'selfEmployed' && !this.selfEmploymentIncome.hasAmount;
		if (isFirstTimeSelfEmployed) this.selfEmploymentIncome.copyFrom(this.salary);
		this.earningType = earningType;
	}
}
