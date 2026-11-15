import { premisesAddressLine } from '$lib/data/premisesAddressLine';
import { pageListedBeside } from '$lib/data/premisesListedPage';
import { premisesSourceLabels } from '$lib/data/foodHygieneRules';
import type { Premises } from '$lib/server/premises/premisesRecord';

const nothingKnown = '';

/**
 * Where a company made from a premises trades, a line each, with the phone number its register lists and the page it
 * lists where that is not the company's own website; no lines for a company made any other way.
 */
export function describeClientPremises(premises: Premises[], companyWebsite: string): string[] {
	if (premises.length === 0) return [];
	return ['', 'Trading at:', ...premises.map((one) => describeTradingLine(one, companyWebsite))];
}

function describeTradingLine(premises: Premises, companyWebsite: string): string {
	const listedPage = pageListedBeside(companyWebsite, premises.website);
	const listing = premises.isGone ? 'no longer listed by' : 'listed by';
	const facts = [
		premisesAddressLine(premises),
		premises.businessType,
		labelled('phone', premises.phone),
		labelled('listed page', listedPage),
		labelled('food hygiene rating', premises.ratingValue),
		`${listing} ${premisesSourceLabels[premises.source]}`,
		premises.sourceUrl
	];
	return facts.filter((fact) => fact !== nothingKnown).join(' — ');
}

function labelled(label: string, value: string): string {
	return value === nothingKnown ? nothingKnown : `${label} ${value}`;
}
