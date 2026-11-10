import { describe, expect, it } from 'vitest';
import { deriveProjectMemberships, managesOrganisation, type DerivedMembership } from './organisationAccess';
import { invoicingDetailsOf } from './organisationInvoicing';
import { emptyAccountsContact } from './organisationRules';
import {
	jeremy,
	jewelBespokeBuild,
	jewelPassiveFire,
	memberships,
	nigel,
	organisations,
	projects
} from './organisationAccess.fixtures';

const copiedDown = [
	{ organisationId: jewelPassiveFire.id, accountId: jeremy, isManager: true },
	{ organisationId: jewelPassiveFire.id, accountId: nigel, isManager: false },
	{ organisationId: jewelBespokeBuild.id, accountId: jeremy, isManager: true },
	{ organisationId: jewelBespokeBuild.id, accountId: nigel, isManager: false }
];
const membershipsAfterCopy = [...memberships, ...copiedDown];
const organisationsWithoutGroups = organisations.map((organisation) => ({ ...organisation, parentOrganisationId: null }));

const reachKey = (row: DerivedMembership) => `${row.projectId} ${row.accountId}`;
const reachOf = (rows: DerivedMembership[]) => rows.map(reachKey).sort();
const sortedByReach = (rows: DerivedMembership[]) =>
	[...rows].sort((left, right) => reachKey(left).localeCompare(reachKey(right)));

const projectOrganisation = (projectId: string) => projects.find((project) => project.id === projectId)?.organisationId;

function repointedToTheCompany(row: DerivedMembership): DerivedMembership {
	const companyId = projectOrganisation(row.projectId);
	const company = organisations.find((organisation) => organisation.id === companyId);
	if (company === undefined || company.parentOrganisationId !== row.viaOrganisationId) return row;
	return { ...row, viaOrganisationId: company.id };
}

describe('copying Jewel Enterprises’ people down to each company beneath it', () => {
	const before = deriveProjectMemberships(organisations, memberships, projects);
	const after = deriveProjectMemberships(organisations, membershipsAfterCopy, projects);

	it('leaves the same people on the same projects', () => {
		expect(reachOf(after)).toEqual(reachOf(before));
	});

	it('marks each grant on a company’s project as coming through that company, as the migration does', () => {
		expect(sortedByReach(after)).toEqual(sortedByReach(before.map(repointedToTheCompany)));
	});

	it('keeps Jeremy a manager of each company he managed from above', () => {
		expect(managesOrganisation(membershipsAfterCopy, organisationsWithoutGroups, jeremy, jewelPassiveFire.id)).toBe(true);
		expect(managesOrganisation(membershipsAfterCopy, organisationsWithoutGroups, jeremy, jewelBespokeBuild.id)).toBe(true);
	});

	it('loses nobody’s access once the grouping is no longer read', () => {
		const flat = deriveProjectMemberships(organisationsWithoutGroups, membershipsAfterCopy, projects);
		expect(reachOf(flat)).toEqual(reachOf(before));
	});
});

describe('filling a company’s blank invoicing details from its parent', () => {
	const jewelAccountsContact = { name: 'Jeremy Ferendinos', email: 'accounts@jewel.example', phone: '' };
	const passiveFireAccountsContact = { ...emptyAccountsContact, name: 'Stuart Barrance' };
	const jewelEnterprises = { name: 'Jewel Enterprises', address: 'Jewel House, London', accountsContact: jewelAccountsContact };
	const passiveFire = { name: 'Jewel Passive Fire Protection', address: '', accountsContact: passiveFireAccountsContact };
	const filled = {
		...passiveFire,
		address: jewelEnterprises.address,
		accountsContact: { ...passiveFireAccountsContact, email: jewelAccountsContact.email }
	};

	it('invoices the company exactly as before, with or without its parent', () => {
		const { inheritedFields, ...shownBefore } = invoicingDetailsOf(passiveFire, jewelEnterprises);
		expect(inheritedFields).toEqual(['address', 'contactEmail']);
		expect(invoicingDetailsOf(filled, jewelEnterprises)).toEqual({ ...shownBefore, inheritedFields: [] });
		expect(invoicingDetailsOf(filled, null)).toEqual({ ...shownBefore, inheritedFields: [] });
	});
});
