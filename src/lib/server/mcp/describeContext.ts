import { actionsFor, areasFor } from './actionRegistry';
import { clientContactsOf } from './clientContactAccess';
import { contextRunLine } from './contextRunLine';
import { countOf } from '$lib/data/countOf';
import { domainRunLine } from './domainRunLine';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { organisationNameLookup } from '$lib/data/organisationNames';
import { raisingDoctrine } from './raisingDoctrine';
import { workflowMapRunLine } from './workflowMapRunLine';
import { workingDoctrine } from './workingDoctrine';
import { ybtCommandsDoctrine } from './ybtCommands';
import type { McpCaller } from './resolveMcpCaller';
import type { OrganisationMembership } from '$lib/data/organisationAccess';

export async function describeContext(caller: McpCaller): Promise<string> {
	const memberships = caller.organisationMemberships;
	const nameOf = await organisationNamesFor(caller, memberships);
	return [
		`Signed in as ${caller.email}.`,
		projectsLine(caller),
		organisationsLine(memberships, nameOf),
		contextRunLine(memberships, nameOf),
		await domainRunLine(caller),
		workflowMapRunLine(memberships, nameOf),
		await clientContactLine(caller),
		staffLine(caller),
		`Areas you can reach: ${areasFor(caller).join(', ')}.`,
		`${actionsFor(caller, null).length} actions are available to you — call list_actions to see them.`,
		ybtCommandsDoctrine,
		'',
		workingDoctrine,
		'',
		raisingDoctrine
	]
		.filter((line) => line !== null)
		.join('\n');
}

async function organisationNamesFor(
	caller: McpCaller,
	memberships: OrganisationMembership[]
): Promise<(organisationId: string) => string> {
	const isOnNoOrganisation = memberships.length === 0;
	if (isOnNoOrganisation) return () => '';
	return organisationNameLookup(await getOrganisations(caller.supabase));
}

function projectsLine(caller: McpCaller): string {
	const { ownedProjectIds, memberProjectIds } = caller;
	const owned = countOf(ownedProjectIds.length, 'project');
	const joined = countOf(memberProjectIds.length, 'project');
	return `You own ${owned} and are on the team of ${joined}. Everyone on a project works and manages it; only its owner can hand it on.`;
}

function organisationsLine(
	memberships: OrganisationMembership[],
	nameOf: (organisationId: string) => string
): string | null {
	if (memberships.length === 0) return null;
	const standings = memberships.map((membership) => {
		const standing = membership.isManager ? ' (project manager)' : '';
		return `${nameOf(membership.organisationId)}${standing}`;
	});
	return `You are on ${countOf(memberships.length, 'organisation')}: ${standings.join(', ')} — every project under each is yours to work; call list_organisations.`;
}

async function clientContactLine(caller: McpCaller): Promise<string | null> {
	const contacts = await clientContactsOf(caller);
	if (contacts.length === 0) return null;
	const organisations = countOf(contacts.length, 'organisation');
	return `You are a contact at ${organisations} YBT works for: call list_portal_projects for their projects, then raise_portal_request and list_portal_requests, as on your portal.`;
}

function staffLine(caller: McpCaller): string | null {
	if (caller.isAdmin)
		return 'You are an administrator at Your Business Today, with the clients register and admin as well.';
	if (caller.isStaff)
		return 'You are staff at Your Business Today, with the clients register as well.';
	return null;
}
