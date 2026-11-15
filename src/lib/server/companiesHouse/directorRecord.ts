import { displayNameFromRegisterName } from './officerName';
import { isDirectorRole } from './directorRole';
import { officerIdFromAppointmentsLink } from './officerLinks';

/** A current director as the officers list names them, with the month and year of birth held in memory only, to match a significant-control entry. */
export type Director = { officerId: string; name: string; surname: string; forename: string; birthMonth: number; birthYear: number };

const surnameFirstSeparator = ', ';

export function parseDirectors(body: Record<string, unknown>): Director[] {
	const items = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
	return items.filter(isCurrentDirector).map(parseDirector).filter((director) => director.officerId !== '');
}

/** Resigned officers and secretaries are left out: a secretary runs the paperwork, not the money. */
function isCurrentDirector(item: Record<string, unknown>): boolean {
	const isResigned = item.resigned_on !== undefined && item.resigned_on !== null;
	if (isResigned) return false;
	return isDirectorRole(String(item.officer_role ?? ''));
}

function parseDirector(item: Record<string, unknown>): Director {
	const links = (item.links ?? {}) as Record<string, unknown>;
	const officerLinks = (links.officer ?? {}) as Record<string, unknown>;
	const birth = (item.date_of_birth ?? {}) as Record<string, unknown>;
	const registerName = String(item.name ?? '');
	const [surname, forenames = ''] = registerName.split(surnameFirstSeparator);
	const [forename = ''] = forenames.trim().split(/\s+/);
	return {
		officerId: officerIdFromAppointmentsLink(String(officerLinks.appointments ?? '')),
		name: displayNameFromRegisterName(registerName),
		surname: surname.trim().toLowerCase(),
		forename: forename.toLowerCase(),
		birthMonth: Number(birth.month ?? 0),
		birthYear: Number(birth.year ?? 0)
	};
}
