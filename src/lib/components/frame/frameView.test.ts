import { describe, expect, it } from 'vitest';
import { frameViewFor } from './frameView';
import type { FrameAccess } from './frameNavigation';
import type { FrameLink } from './frameGroups';
import type { FramePicks } from './framePicks';

const member: FrameAccess = {
	isStaff: false,
	isAdmin: false,
	hasOrganisations: false,
	isPortalAccount: false,
	isPortalAdministrator: false
};
const staff: FrameAccess = { ...member, isStaff: true };
const administrator: FrameAccess = { ...member, isStaff: true, isAdmin: true };
const clientContact: FrameAccess = { ...member, isPortalAccount: true };
const clientAdministrator: FrameAccess = { ...clientContact, isPortalAdministrator: true };

const noPicks: FramePicks = {
	organisations: [],
	pickedOrganisationId: null,
	projects: [],
	pickedProjectId: null,
	organisationLinks: [],
	moduleLinks: [],
	homePath: null
};

const siteUrl = (path: string) => new URL(path, 'https://yourbusiness.today');
const viewAt = (access: FrameAccess, path: string) => frameViewFor(access, siteUrl(path), null);
const labelsFor = (access: FrameAccess) => viewAt(access, '/').links.map(({ label }) => label);
const menuLabelsFor = (access: FrameAccess) => viewAt(access, '/').menuLinks.map(({ label }) => label);
const trailAt = (access: FrameAccess, path: string) => viewAt(access, path).trail;

describe('frameViewFor', () => {
	it('gives a member of staff the work inside an organisation, and leaves the sales pages to the Sales module', () => {
		expect(labelsFor(staff)).toEqual(['Projects', 'Leads', 'Clients', 'Leaderboard']);
	});

	it('puts what sits above an organisation in the top-right menu, with Admin for an administrator only', () => {
		expect(menuLabelsFor(staff)).toEqual(['Organisations', 'Account']);
		expect(menuLabelsFor(administrator)).toEqual(['Organisations', 'Admin', 'Account']);
		expect(labelsFor(administrator)).not.toContain('Admin');
	});

	it('gives someone who is neither staff nor a client contact their projects, and their organisations in the menu', () => {
		expect(labelsFor(member)).toEqual(['Projects']);
		expect(menuLabelsFor(member)).toEqual(['Account']);
		expect(menuLabelsFor({ ...member, hasOrganisations: true })).toEqual(['Organisations', 'Account']);
	});

	it('gives a client contact the portal’s links, and People to its administrators', () => {
		const portalLabels = ['Your projects', 'Your workflow map', 'Billing', 'Connect your Claude'];
		expect(labelsFor(clientContact)).toEqual(portalLabels);
		expect(labelsFor(clientAdministrator)).toEqual([...portalLabels, 'People']);
		expect(menuLabelsFor(clientContact)).toEqual([]);
	});

	it('marks the link the page sits under most closely and heads the page with it', () => {
		expect(viewAt(staff, '/clients/c-1').currentHref).toBe('/clients');
		expect(trailAt(staff, '/clients/patches/patch-1')).toMatchObject({ crumbs: [], heading: 'Patches' });
		expect(trailAt(staff, '/organisations')).toMatchObject({ heading: 'Organisations' });
		expect(trailAt(clientContact, '/portal/projects/project-1')).toMatchObject({ heading: 'Your projects' });
		expect(trailAt(clientContact, '/portal/billing')).toMatchObject({ heading: 'Billing' });
	});

	it('heads the notifications page, and falls back to the company name', () => {
		expect(trailAt(staff, '/notifications')).toMatchObject({ heading: 'Notifications' });
		expect(viewAt(staff, '/notifications').currentHref).toBe('/notifications');
		expect(trailAt(member, '/clients')).toMatchObject({ heading: 'Your Business Today' });
	});

	it('sends a client contact home to the portal and signs them out there', () => {
		const portalView = viewAt(clientContact, '/portal');
		expect(portalView.homePath).toBe('/portal');
		expect(portalView.signOutPath).toBe('/portal?/signOut');
		expect(viewAt(staff, '/projects').signOutPath).toBe('/account?/signOut');
	});

	it('puts the picked organisation’s pages and modules first, each link once, and opens home on its projects', () => {
		const organisationLinks: FrameLink[] = [
			{ href: '/organisations/harbour', label: 'Overview', icon: 'layoutDashboard' },
			{ href: '/projects', label: 'Projects', icon: 'folderKanban' }
		];
		const moduleLinks: FrameLink[] = [{ href: '/organisations/harbour/books', label: 'Accounts', icon: 'chartColumn' }];
		const picks = { ...noPicks, organisationLinks, moduleLinks, homePath: '/projects' };
		const view = frameViewFor(staff, siteUrl('/projects/harbour-site/tasks/one'), picks);
		const labels = view.links.map(({ label }) => label);
		expect(labels).toEqual(['Overview', 'Projects', 'Accounts', 'Leads', 'Clients', 'Leaderboard']);
		expect(labels.filter((label) => label === 'Projects')).toHaveLength(1);
		expect(view.currentHref).toBe('/projects');
		expect(view.homePath).toBe('/projects');
	});

	it('keeps today’s home when nothing is picked', () => {
		expect(frameViewFor(staff, siteUrl('/projects'), noPicks).homePath).toBe('/');
		expect(frameViewFor(clientContact, siteUrl('/portal'), noPicks).homePath).toBe('/portal');
	});
});

