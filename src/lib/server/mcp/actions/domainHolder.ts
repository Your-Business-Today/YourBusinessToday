import { brainOf } from './businessBrainAnswers';
import { domainRunActionName } from './domainRunActionName';
import { portalAddress } from '$lib/portal/portalAddress';
import type { DomainScope } from '$lib/server/businessBrain/domainScope';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Whose domain an answer speaks of, with where it is kept and drawn. */
export type DomainHolder = {
	scope: DomainScope;
	name: string;
	brainName: string;
	address: string;
	readAction: string;
	setAction: string;
};

/** The organisation's own domain, kept in its Your Business Brain and drawn on its Domain tab. */
export function organisationDomainHolder(organisation: Organisation): DomainHolder {
	const { id, name } = organisation;
	return {
		scope: { organisationId: id, projectId: null },
		name,
		brainName: brainOf(organisation),
		address: `https://${portalAddress.hostName}/organisations/${id}/domain`,
		readAction: 'read_business_brain_domain',
		setAction: domainRunActionName
	};
}
