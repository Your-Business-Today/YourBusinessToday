import { invoicingFieldLabels } from '$lib/data/organisationInvoicing';
import { projectStatusLabels } from '$lib/data/projectStatus';
import { standingLabelOf } from '$lib/data/organisationStanding';
import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { OrganisationProject } from '$lib/server/organisations/getProjectsForOrganisation';
import type { OrganisationSummary } from '$lib/server/organisations/getOrganisationsWithCounts';

export function describeOrganisationList(organisations: OrganisationSummary[]): string {
	if (organisations.length === 0) return 'You are on no organisation yet.';
	return organisations.map(describeOrganisationLine).join('\n');
}

function describeOrganisationLine(organisation: OrganisationSummary): string {
	const counts = `${organisation.projectCount} project(s), ${organisation.memberCount} people`;
	return `${organisation.name} — ${counts} (id: ${organisation.id})`;
}

export function describeOrganisationInFull(
	organisation: Organisation,
	members: OrganisationMember[],
	projects: OrganisationProject[]
): string {
	return [
		`${organisation.name} (id: ${organisation.id})`,
		...invoicingLines(organisation),
		'',
		'People:',
		members.length === 0 ? 'Nobody yet.' : members.map(describeMemberLine).join('\n'),
		'',
		'Projects:',
		projects.length === 0 ? 'None yet.' : projects.map(describeProjectLine).join('\n')
	].join('\n');
}

function invoicingLines(organisation: Organisation): string[] {
	const contact = organisation.accountsContact;
	return [
		'Invoicing:',
		`${invoicingFieldLabels.address}: ${organisation.address || 'not set'}`,
		`${invoicingFieldLabels.contactName}: ${contact.name || 'not set'}`,
		`${invoicingFieldLabels.contactEmail}: ${contact.email || 'not set'}`,
		`${invoicingFieldLabels.contactPhone}: ${contact.phone || 'not set'}`
	];
}

function describeMemberLine(member: OrganisationMember): string {
	return `${member.name} — ${standingLabelOf(member.isManager).toLowerCase()}, ${member.email} (account id: ${member.id})`;
}

function describeProjectLine(project: OrganisationProject): string {
	return `${project.name} — ${projectStatusLabels[project.status]} (id: ${project.id})`;
}
