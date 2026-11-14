import { domainCheckActionName } from './actions/domainCheckActionName';
import { domainCheckRequest, organisationDomainRequest } from '$lib/data/personRequests';
import { domainRunActionName } from './actions/domainRunActionName';
import { readActionToolName } from './actionToolNames';
import { usableModuleOrganisation } from './organisationModuleGate';
import type { McpCaller } from './resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** For a person on organisations with Your Business Brain open to them: setting an organisation's domain starts with a domain run, and checking it with a domain check. */
export async function domainRunLine(caller: McpCaller): Promise<string | null> {
	const organisationIds = caller.organisationMemberships.map((membership) => membership.organisationId);
	const usable = await Promise.all(organisationIds.map((organisationId) => usableModuleOrganisation(caller, organisationId, 'business_brain')));
	const organisations = usable.filter((organisation): organisation is Organisation => organisation !== null);
	if (organisations.length === 0) return null;
	const named = organisations.map((organisation) => `${organisation.name} (${organisation.id})`).join(', ');
	return (
		`To set an organisation's own domain, as "${organisationDomainRequest}" asks, call ${readActionToolName} with ` +
		`${domainRunActionName} and the organisationId of ${named}, and follow what it answers. ` +
		`To find and repair its faults, as "${domainCheckRequest}" asks, call ${readActionToolName} with ${domainCheckActionName} the same way.`
	);
}
