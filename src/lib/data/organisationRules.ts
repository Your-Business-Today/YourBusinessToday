import { detailKinds } from './organisationDetailField';
import { isEmailShaped } from './emailShape';
import {
	organisationDetailFields,
	readEveryDetail,
	type DetailField,
	type OrganisationDetailValues
} from './organisationDetailGroups';

/** What an organisation says about itself: its name, and everything we hold about it as a client. */
export type OrganisationDetails = { name: string } & OrganisationDetailValues;

export const longestOrganisationName = 120;

export const blankOrganisationDetails: OrganisationDetails = { name: '', ...readEveryDetail(() => '') };

/** Whether a name fits an organisation's name column. */
export function fitsOrganisationName(name: string): boolean {
	return name.length <= longestOrganisationName;
}

export const organisationNeedsName = 'An organisation needs a name.';
export const organisationNameTooLong = `The organisation name is at most ${longestOrganisationName} characters.`;

/** Why the details cannot be saved as they stand, or null when every value fits its column. */
export function validateOrganisationDetails(details: OrganisationDetails): string | null {
	if (details.name === '') return organisationNeedsName;
	if (!fitsOrganisationName(details.name)) return organisationNameTooLong;
	const refusals = organisationDetailFields.map((field) => detailRefusal(field, details[field.key]));
	return refusals.find((refusal) => refusal !== null) ?? null;
}

function detailRefusal(field: DetailField, value: string): string | null {
	if (value.length > field.longest) return `${field.label} is at most ${field.longest} characters.`;
	const isEmailToCheck = field.kind === detailKinds.email && value !== '';
	if (isEmailToCheck && !isEmailShaped(value)) return `${field.label} does not read as an email address.`;
	return null;
}
