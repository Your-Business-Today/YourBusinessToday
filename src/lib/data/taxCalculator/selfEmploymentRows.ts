import type { BreakdownRow, BreakdownScale } from './breakdownRow';
import { detail, line, subtotal } from './breakdownRow';
import type { SelfEmploymentProfit } from './selfEmploymentProfit';
import { deducted, formatMiles, formatMoney, formatPencePerMile, formatWholePounds } from './taxCalculatorFormatting';

export function selfEmploymentRows(trade: SelfEmploymentProfit | null, scale: BreakdownScale): BreakdownRow[] {
	if (trade === null) return [];
	const claimRows = trade.usesTradingAllowance ? tradingAllowanceRows(trade, scale) : allowableClaimRows(trade, scale);
	const profitRows = claimRows.length > 0 ? [subtotal('Self-employed profit', formatMoney(scale.of(trade.profit)))] : [];
	return [line('Self-employed income', formatMoney(scale.of(trade.income))), ...claimRows, ...profitRows];
}

function tradingAllowanceRows(trade: SelfEmploymentProfit, scale: BreakdownScale): BreakdownRow[] {
	const comparison =
		trade.allowableClaims > 0 ? `more than your ${formatMoney(trade.allowableClaims)} of expenses` : 'as you have no expenses';
	return [
		line('Less: trading allowance', deducted(scale.of(trade.tradingAllowance))),
		detail(`The tax-free ${formatWholePounds(trade.tradingAllowance)} allowance is used instead, ${comparison}.`)
	];
}

function allowableClaimRows(trade: SelfEmploymentProfit, scale: BreakdownScale): BreakdownRow[] {
	return [...expenseRows(trade, scale), ...mileageRows(trade, scale), ...homeWorkingRows(trade, scale)];
}

function expenseRows(trade: SelfEmploymentProfit, scale: BreakdownScale): BreakdownRow[] {
	if (trade.expenses <= 0) return [];
	return [line('Less: business expenses', deducted(scale.of(trade.expenses)))];
}

function mileageRows(trade: SelfEmploymentProfit, scale: BreakdownScale): BreakdownRow[] {
	const { mileage } = trade;
	if (mileage.amount <= 0) return [];
	const claimRow = line('Less: mileage', deducted(scale.of(mileage.amount)));
	if (!scale.isYearly) return [claimRow];
	const portionDetails = mileage.portions.map((portion) =>
		detail(`${formatMiles(portion.miles)} at ${formatPencePerMile(portion.ratePerMile)} a mile`)
	);
	return [claimRow, ...portionDetails];
}

function homeWorkingRows(trade: SelfEmploymentProfit, scale: BreakdownScale): BreakdownRow[] {
	const { homeWorking } = trade;
	if (homeWorking.amount <= 0) return [];
	const claimRow = line('Less: working from home', deducted(scale.of(homeWorking.amount)));
	if (!scale.isYearly) return [claimRow];
	return [claimRow, detail(`12 months at ${formatMoney(homeWorking.monthlyAmount)} a month`)];
}
