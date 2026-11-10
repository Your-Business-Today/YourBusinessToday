import { roundToPence } from '$lib/data/books/money';
import type { CorporationTaxRules } from './companyRuleTypes';

export type CorporationTaxBand = 'noProfit' | 'smallProfitsRate' | 'marginalRelief' | 'mainRate';
export const corporationTaxBands = {
	noProfit: 'noProfit',
	smallProfitsRate: 'smallProfitsRate',
	marginalRelief: 'marginalRelief',
	mainRate: 'mainRate'
} as const satisfies Record<CorporationTaxBand, CorporationTaxBand>;

export type CorporationTaxCalculation = {
	profit: number;
	band: CorporationTaxBand;
	rate: number;
	taxAtRate: number;
	marginalRelief: number;
	total: number;
};

export function corporationTaxFor(profit: number, rules: CorporationTaxRules): CorporationTaxCalculation {
	if (profit <= 0) return taxAt(profit, corporationTaxBands.noProfit, 0);
	if (profit <= rules.lowerLimit) return taxAt(profit, corporationTaxBands.smallProfitsRate, rules.smallProfitsRate);
	if (profit >= rules.upperLimit) return taxAt(profit, corporationTaxBands.mainRate, rules.mainRate);
	const marginalRelief = roundToPence(rules.marginalReliefFraction * (rules.upperLimit - profit));
	return taxAt(profit, corporationTaxBands.marginalRelief, rules.mainRate, marginalRelief);
}

function taxAt(profit: number, band: CorporationTaxBand, rate: number, marginalRelief = 0): CorporationTaxCalculation {
	const taxAtRate = roundToPence(Math.max(0, profit) * rate);
	return { profit, band, rate, taxAtRate, marginalRelief, total: roundToPence(taxAtRate - marginalRelief) };
}
