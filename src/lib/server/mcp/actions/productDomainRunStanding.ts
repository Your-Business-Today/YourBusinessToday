import { entitiesOf, type DomainModel } from '$lib/data/blueprint/domainModel';
import type { DomainHolder } from './domainHolder';
import type { DomainSource } from '$lib/server/businessBrain/readDomainSources';
import type { OrganisationDomain } from '$lib/data/organisationDomain';

/** What Your Business Today holds for a product that bears on its domain, as the product domain run reads it first. */
export type ProductDomainRunStanding = {
	holder: DomainHolder;
	organisationName: string;
	domain: OrganisationDomain | null;
	sources: DomainSource[];
	repositoryUrl: string;
	repositoryDomain: DomainModel | null;
	organisationDomain: OrganisationDomain | null;
};

/** Step 1 of the product domain run: what is held already, and what the run should build on. */
export function productDomainRunStanding(standing: ProductDomainRunStanding): string {
	return ['1. **Say what Your Business Today holds already.**', ownDomainHeld(standing), repositoryHeld(standing), organisationDomainHeld(standing)].join('\n');
}

function ownDomainHeld({ holder, domain, sources }: ProductDomainRunStanding): string {
	if (domain === null) return `   - ${holder.name}'s own domain: nothing yet. This is the first run, so it is a broad first modelling of the product.`;
	const { contexts, model } = domain;
	const filedFrom = sources.map((source) => `${source.title} (${source.filedAt.slice(0, 10)})`).join('; ');
	return [
		`   - ${holder.name}'s own domain in ${holder.brainName}: ${contexts.length} contexts, ${entitiesOf(model).length} entities. Read it whole with ${holder.readAction} before anything else, and build on it.`,
		`   - Filed from: ${filedFrom || 'no source named'}. Read a source again only when it has changed.`
	].join('\n');
}

function repositoryHeld({ repositoryUrl, repositoryDomain }: ProductDomainRunStanding): string {
	if (repositoryUrl === '') return '   - Repository: none recorded, so the product is modelled from its designs, documents and stories alone.';
	if (repositoryDomain === null) return `   - Repository: ${repositoryUrl}, not yet read into a domain. Read it as step 3 says.`;
	const entityCount = entitiesOf(repositoryDomain).length;
	return `   - Repository: ${repositoryUrl}. What GitHub gave it holds ${entityCount} entities (read_project_domain); take it as one source, and model the product's language, not its tables.`;
}

function organisationDomainHeld({ organisationName, organisationDomain }: ProductDomainRunStanding): string {
	if (organisationDomain === null) return `   - ${organisationName}'s own domain: none filed yet, so take the business's words from the product's sources.`;
	const { contexts } = organisationDomain;
	return `   - ${organisationName}'s own domain: ${contexts.length} contexts. Read it with read_business_brain_domain for the business's words, and use the same word for the same concept.`;
}
