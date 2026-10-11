import type { Organisation } from './organisationRecord';

export type OrganisationChoice = { organisationId: string | null } | { refusal: string };

export const organisationNotYours = 'That organisation is not one you are on.';

/** The organisation a project form names, which must be one the person can see; blank means none. */
export function readOrganisationChoice(formData: FormData, reachable: Organisation[]): OrganisationChoice {
	const organisationId = String(formData.get('organisationId') ?? '').trim();
	if (organisationId === '') return { organisationId: null };
	const isReachable = reachable.some((organisation) => organisation.id === organisationId);
	if (!isReachable) return { refusal: organisationNotYours };
	return { organisationId };
}
