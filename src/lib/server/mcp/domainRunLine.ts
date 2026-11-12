import { organisationDomainRequest, productDomainRequest } from '$lib/data/personRequests';
import { domainRunActionName, productDomainRunActionName } from './actions/domainRunActionName';
import { readActionToolName } from './actionToolNames';
import { usableModuleOrganisation } from './organisationModuleGate';
import type { McpCaller } from './resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** For a person on organisations with Your Business Brain open to them: setting an organisation's or a product's domain starts with a domain run. */
export async function domainRunLine(caller: McpCaller): Promise<string | null> {
	const organisationIds = caller.organisationMemberships.map((membership) => membership.organisationId);
	const usable = await Promise.all(organisationIds.map((organisationId) => usableModuleOrganisation(caller, organisationId, 'business_brain')));
	const organisations = usable.filter((organisation): organisation is Organisation => organisation !== null);
	if (organisations.length === 0) return null;
	const named = organisations.map((organisation) => `${organisation.name} (${organisation.id})`);
	return (
		`To set an organisation's own domain, as "${organisationDomainRequest}" asks, call ${readActionToolName} with ` +
		`${domainRunActionName} and the organisationId of ${named.join(', ')}, and follow what it answers. ` +
		`To set a product's own domain, as "${productDomainRequest}" asks, call it with ${productDomainRunActionName} ` +
		'and the projectId of a product of one of them that you are on.'
	);
}
