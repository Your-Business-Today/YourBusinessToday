import { blankSources, contractBlanks, type ContractBlank } from '$lib/data/contractBlanks';
import type { BlankValues } from './fillContractBlanks';
import type { LeadQuote, LeadQuoteLine } from '$lib/data/leadQuoteRules';
import type { OrganisationDetailValues } from '$lib/data/organisationDetailGroups';

const amountAfterThePoundSign = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** What a pack fills its blanks with: the organisation's details, then the quote's fees, then what was written in, which wins. */
export function contractPackValues(details: OrganisationDetailValues, quote: LeadQuote | null, writtenValues: BlankValues): BlankValues {
	return { ...valuesFromOrganisation(details), ...valuesFromQuote(quote), ...writtenValues };
}

function valuesFromOrganisation(details: OrganisationDetailValues): BlankValues {
	const blanks = contractBlanks.filter((blank) => blank.source === blankSources.organisation);
	return Object.fromEntries(blanks.map((blank) => [blank.label, detailFor(details, blank)]));
}

function detailFor(details: OrganisationDetailValues, blank: ContractBlank): string {
	const key = blank.organisationDetail as keyof OrganisationDetailValues;
	return details[key] ?? '';
}

function valuesFromQuote(quote: LeadQuote | null): BlankValues {
	if (quote === null) return {};
	const blanks = contractBlanks.filter((blank) => blank.source === blankSources.quote);
	return Object.fromEntries(blanks.map((blank) => [blank.label, feeFor(quote.lines, blank)]));
}

function feeFor(lines: LeadQuoteLine[], blank: ContractBlank): string {
	const pricedLine = lines.find((line) => line.feeBasis === blank.feeBasis && line.feeAmount !== null);
	if (pricedLine?.feeAmount == null) return '';
	return amountAfterThePoundSign.format(pricedLine.feeAmount);
}
