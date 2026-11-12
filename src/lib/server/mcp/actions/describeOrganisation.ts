import { organisationDetailGroups, type DetailGroup } from '$lib/data/organisationDetailGroups';
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
		...organisationDetailGroups.flatMap((group) => describeDetailGroup(group, organisation)),
		'',
		'People:',
		members.length === 0 ? 'Nobody yet.' : members.map(describeMemberLine).join('\n'),
		'',
		'Projects:',
		projects.length === 0 ? 'None yet.' : projects.map(describeProjectLine).join('\n')
	].join('\n');
}

const notSet = 'not set';

function describeDetailGroup(group: DetailGroup, organisation: Organisation): string[] {
	const details = group.fields.map((field) => `${field.label}: ${organisation[field.key] || notSet}`);
	return [`${group.title}:`, ...details];
}

function describeMemberLine(member: OrganisationMember): string {
	return `${member.name} — ${standingLabelOf(member.isManager).toLowerCase()}, ${member.email} (account id: ${member.id})`;
}

function describeProjectLine(project: OrganisationProject): string {
	return `${project.name} — ${projectStatusLabels[project.status]} (id: ${project.id})`;
}
