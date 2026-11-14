import { normaliseCompanyNumber, validateCompanyNumber } from '$lib/data/prospectRules';

/** A current entry on a company's significant-control list: a person, or a UK company, holding over 25% of its shares. */
export type SignificantControl = { name: string; surname: string; forename: string; birthMonth: number; birthYear: number; companyNumber: string };

const shareOwnership = 'ownership-of-shares';
const corporateKind = 'corporate-entity';

export function parseSignificantControl(body: Record<string, unknown>): SignificantControl[] {
	const items = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
	return items.filter(isCurrentShareholder).map(parseEntry);
}

function isCurrentShareholder(item: Record<string, unknown>): boolean {
	const hasCeased = item.ceased_on !== undefined && item.ceased_on !== null;
	if (hasCeased) return false;
	const natures = Array.isArray(item.natures_of_control) ? item.natures_of_control.map(String) : [];
	return natures.some((nature) => nature.startsWith(shareOwnership));
}

function parseEntry(item: Record<string, unknown>): SignificantControl {
	const nameElements = (item.name_elements ?? {}) as Record<string, unknown>;
	const birth = (item.date_of_birth ?? {}) as Record<string, unknown>;
	return {
		name: String(item.name ?? ''),
		surname: String(nameElements.surname ?? '').trim().toLowerCase(),
		forename: String(nameElements.forename ?? '').trim().toLowerCase(),
		birthMonth: Number(birth.month ?? 0),
		birthYear: Number(birth.year ?? 0),
		companyNumber: ukCompanyNumberOf(item)
	};
}

/** The registration number of a corporate entry, when it is a UK company number; an overseas owner has none here. */
function ukCompanyNumberOf(item: Record<string, unknown>): string {
	const isCorporate = String(item.kind ?? '').startsWith(corporateKind);
	if (!isCorporate) return '';
	const identification = (item.identification ?? {}) as Record<string, unknown>;
	const number = normaliseCompanyNumber(String(identification.registration_number ?? ''));
	return validateCompanyNumber(number) === null ? number : '';
}
