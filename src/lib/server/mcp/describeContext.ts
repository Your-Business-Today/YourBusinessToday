import { actionsFor, areasFor } from './actionRegistry';
import { clientContactsOf } from './clientContactAccess';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { organisationNameLookup } from '$lib/data/organisationFamilies';
import { raisingDoctrine } from './raisingDoctrine';
import { workingDoctrine } from './workingDoctrine';
import type { McpCaller } from './resolveMcpCaller';

export async function describeContext(caller: McpCaller): Promise<string> {
	return [
		`Signed in as ${caller.email}.`,
		projectsLine(caller),
		await organisationsLine(caller),
		await clientContactLine(caller),
		staffLine(caller),
		`Areas you can reach: ${areasFor(caller).join(', ')}.`,
		`${actionsFor(caller, null).length} actions are available to you — call list_actions to see them.`,
		'',
		workingDoctrine,
		'',
		raisingDoctrine
	]
		.filter((line) => line !== null)
		.join('\n');
}

function projectsLine(caller: McpCaller): string {
	const { ownedProjectIds, memberProjectIds } = caller;
	const owned = countOf(ownedProjectIds.length, 'project');
	const joined = countOf(memberProjectIds.length, 'project');
	return `You own ${owned} and are on the team of ${joined}. Everyone on a project works and manages it; only its owner can hand it on.`;
}

async function organisationsLine(caller: McpCaller): Promise<string | null> {
	const memberships = caller.organisationMemberships;
	if (memberships.length === 0) return null;
	const nameOf = organisationNameLookup(await getOrganisations(caller.supabase));
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

function countOf(count: number, noun: string): string {
	if (count === 0) return `no ${noun}s`;
	if (count === 1) return `one ${noun}`;
	return `${count} ${noun}s`;
}
