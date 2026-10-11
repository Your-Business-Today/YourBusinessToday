import { invoicingDetailsOf, invoicingFieldLabels } from '$lib/data/organisationInvoicing';
import { projectStatusLabels } from '$lib/data/projectStatus';
import { standingLabelOf } from '$lib/data/organisationStanding';
import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { OrganisationProject } from '$lib/server/organisations/getProjectsForOrganisation';
import type { OrganisationSummary } from '$lib/server/organisations/getOrganisationsWithCounts';

export function describeOrganisationList(organisations: OrganisationSummary[]): string {
	if (organisations.length === 0) return 'You are on no organisation yet.';
	const parents = organisations.filter((organisation) => organisation.parentOrganisationId === null);
	const children = organisations.filter((organisation) => organisation.parentOrganisationId !== null);
	return [
		...parents.flatMap((parent) => [
			describeOrganisationLine(parent, ''),
			...children.filter((child) => child.parentOrganisationId === parent.id).map((child) => describeOrganisationLine(child, '  '))
		]),
		...children.filter((child) => !parents.some((parent) => parent.id === child.parentOrganisationId)).map((child) => describeOrganisationLine(child, ''))
	].join('\n');
}

function describeOrganisationLine(organisation: OrganisationSummary, indent: string): string {
	const counts = `${organisation.projectCount} project(s), ${organisation.memberCount} people`;
	const businesses = organisation.subOrganisationCount === 0 ? '' : `, ${organisation.subOrganisationCount} sub-organisation(s)`;
	return `${indent}${organisation.name} — ${counts}${businesses} (id: ${organisation.id})`;
}

export function describeOrganisationInFull(
	organisation: Organisation,
	parent: Organisation | null,
	children: Organisation[],
	members: OrganisationMember[],
	projects: OrganisationProject[]
): string {
	return [
		`${organisation.name} (id: ${organisation.id})${partOfLine(parent)}`,
		...invoicingLines(organisation, parent),
		'',
		'People:',
		members.length === 0 ? 'Nobody yet.' : members.map(describeMemberLine).join('\n'),
		...subOrganisationLines(children),
		'',
		'Projects:',
		projects.length === 0 ? 'None yet.' : projects.map(describeProjectLine).join('\n')
	].join('\n');
}

function partOfLine(parent: Organisation | null): string {
	if (parent === null) return '';
	return ` — a business of ${parent.name} (id: ${parent.id}); everyone on ${parent.name} reaches its projects too`;
}

function invoicingLines(organisation: Organisation, parent: Organisation | null): string[] {
	const invoicing = invoicingDetailsOf(organisation, parent);
	const contact = invoicing.accountsContact;
	const from = parent === null ? '' : ` (what is blank here comes from ${parent.name})`;
	return [
		`Invoicing${from}:`,
		`${invoicingFieldLabels.address}: ${invoicing.address || 'not set'}`,
		`${invoicingFieldLabels.contactName}: ${contact.name || 'not set'}`,
		`${invoicingFieldLabels.contactEmail}: ${contact.email || 'not set'}`,
		`${invoicingFieldLabels.contactPhone}: ${contact.phone || 'not set'}`
	];
}

function describeMemberLine(member: OrganisationMember): string {
	return `${member.name} — ${standingLabelOf(member.isManager).toLowerCase()}, ${member.email} (account id: ${member.id})`;
}

function subOrganisationLines(children: Organisation[]): string[] {
	if (children.length === 0) return [];
	return ['', 'Sub-organisations:', ...children.map((child) => `${child.name} (id: ${child.id})`)];
}

function describeProjectLine(project: OrganisationProject): string {
	return `${project.name} — ${projectStatusLabels[project.status]}, under ${project.organisationName} (id: ${project.id})`;
}
