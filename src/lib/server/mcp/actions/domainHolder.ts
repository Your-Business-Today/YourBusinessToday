import { brainOf } from './businessBrainAnswers';
import { domainRunActionName } from './domainRunActionName';
import { portalAddress } from '$lib/portal/portalAddress';
import type { DomainScope } from '$lib/server/businessBrain/domainScope';
import type { ModuleProduct } from '../organisationModuleGate';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Whose domain an answer speaks of: the organisation's own or one product's, with where it is kept and drawn. */
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

/** A product's own domain, kept in its organisation's Your Business Brain and drawn on the product's Domain tab. */
export function productDomainHolder({ organisation, project }: ModuleProduct): DomainHolder {
	const { id, name } = project;
	return {
		scope: { organisationId: organisation.id, projectId: id },
		name,
		brainName: `the brain of ${name}, in ${brainOf(organisation)}`,
		address: `https://${portalAddress.hostName}/projects/${id}/domain`,
		readAction: 'read_product_brain_domain',
		setAction: 'file_product_brain_domain'
	};
}
