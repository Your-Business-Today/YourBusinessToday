import { companyDetails } from './organisationCompanyDetails';
import { contractDetails } from './organisationContractDetails';
import { dataProtectionDetails } from './organisationDataProtectionDetails';
import { invoicingDetails } from './organisationInvoicingDetails';
import type { DetailFieldOf, DetailGroupOf } from './organisationDetailField';

const groupsInPageOrder = [companyDetails, invoicingDetails, contractDetails, dataProtectionDetails] as const;

export type OrganisationDetailKey = (typeof groupsInPageOrder)[number]['fields'][number]['key'];

export type DetailField = DetailFieldOf<OrganisationDetailKey>;

export type DetailGroup = DetailGroupOf<OrganisationDetailKey>;

/** Every detail an organisation holds beside its name, each as text and blank until it is given. */
export type OrganisationDetailValues = Record<OrganisationDetailKey, string>;

/** Everything we must hold about a client we sign up, in the groups and the order the Details page shows. */
export const organisationDetailGroups: readonly DetailGroup[] = groupsInPageOrder;

export const organisationDetailFields: readonly DetailField[] = organisationDetailGroups.flatMap((group) => group.fields);

/** Every detail of an organisation, each value as the reader gives it. */
export function readEveryDetail(read: (field: DetailField) => string): OrganisationDetailValues {
	const values = organisationDetailFields.map((field) => [field.key, read(field)]);
	return Object.fromEntries(values) as OrganisationDetailValues;
}
