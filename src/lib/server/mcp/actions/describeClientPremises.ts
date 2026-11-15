import { premisesAddressLine } from '$lib/data/premisesAddressLine';
import { premisesSourceLabels } from '$lib/data/foodHygieneRules';
import type { Premises } from '$lib/server/premises/premisesRecord';

const nothingKnown = '';

/** Where a company made from a premises trades, a line each, with the phone number its register lists; no lines for a company made any other way. */
export function describeClientPremises(premises: Premises[]): string[] {
	if (premises.length === 0) return [];
	return ['', 'Trading at:', ...premises.map(describeTradingLine)];
}

function describeTradingLine(premises: Premises): string {
	const { phone, ratingValue } = premises;
	const listing = premises.isGone ? 'no longer listed by' : 'listed by';
	const facts = [
		premisesAddressLine(premises),
		premises.businessType,
		phone === nothingKnown ? nothingKnown : `phone ${phone}`,
		ratingValue === nothingKnown ? nothingKnown : `food hygiene rating ${ratingValue}`,
		`${listing} ${premisesSourceLabels[premises.source]}`,
		premises.sourceUrl
	];
	return facts.filter((fact) => fact !== nothingKnown).join(' — ');
}
