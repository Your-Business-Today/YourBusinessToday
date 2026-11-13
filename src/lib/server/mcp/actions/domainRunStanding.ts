import { brainOf } from './businessBrainAnswers';
import { entitiesOf } from '$lib/data/blueprint/domainModel';
import { organisationModuleLabels, type OrganisationModule } from '$lib/data/organisationModules';
import type { DomainSource } from '$lib/server/businessBrain/readDomainSources';
import type { OrganisationDomain } from '$lib/data/organisationDomain';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** What Your Business Today holds for the organisation that bears on its domain, as the domain run reads it first. */
export type DomainRunStanding = {
	organisation: Organisation;
	domain: OrganisationDomain | null;
	sources: DomainSource[];
	products: { id: string; name: string }[];
	switchedOn: OrganisationModule[];
};

/** Step 1 of the domain run: what is held already, and what the run should read first. */
export function domainRunStanding(standing: DomainRunStanding): string {
	const { organisation, switchedOn } = standing;
	return [
		'1. **Say what Your Business Today holds already.**',
		domainHeld(standing),
		productsHeld(standing),
		`Switched on for ${organisation.name}: ${switchedOn.map((module) => organisationModuleLabels[module]).join(', ')}.`
	].join('\n');
}

function domainHeld({ organisation, domain, sources }: DomainRunStanding): string {
	if (domain === null) return `   - The domain: nothing yet. This is the first run, so it is a broad first modelling of how ${organisation.name} works.`;
	const { contexts, model } = domain;
	const core = contexts.find((context) => context.isCoreDomain);
	const coreWords = core === undefined ? 'no core domain marked yet' : `${core.title} the core domain`;
	const filedFrom = sources.map((source) => `${source.title} (${source.filedAt.slice(0, 10)})`).join('; ');
	return [
		`   - The domain in ${brainOf(organisation)}: ${contexts.length} contexts, ${coreWords}, ${entitiesOf(model).length} entities. Read it whole with read_business_brain_domain before anything else, and build on it.`,
		`   - Filed from: ${filedFrom || 'no source named'}. Read a source again only when it has changed.`
	].join('\n');
}

function productsHeld({ products }: DomainRunStanding): string {
	if (products.length === 0) return '   - Products: none open to you.';
	const named = products.map((product) => `${product.name} (${product.id})`).join(', ');
	return `   - Products: ${named}. Each one's domain is read with read_project_domain; take the business's words from them, but model the business, not the software.`;
}
