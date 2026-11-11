import { describe, expect, it } from 'vitest';
import { frameViewFor } from './frameView';
import type { FrameAccess } from './frameNavigation';
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

describe('frameViewFor', () => {
	it('gives a member of staff the work and business links they have today', () => {
		const staffLabels = ['Projects', 'Organisations', 'Clients', 'People', 'Patches', 'Patch feed'];
		expect(labelsFor(staff)).toEqual([...staffLabels, 'Account']);
	});

	it('adds Admin for an administrator only', () => {
		expect(labelsFor(administrator)).toContain('Admin');
		expect(labelsFor(staff)).not.toContain('Admin');
	});

	it('gives someone who is neither staff nor a client contact their projects and account', () => {
		expect(labelsFor(member)).toEqual(['Projects', 'Account']);
		expect(labelsFor({ ...member, hasOrganisations: true })).toEqual([
			'Projects',
			'Organisations',
			'Account'
		]);
	});

	it('gives a client contact the portal’s links, and People to its administrators', () => {
		const portalLabels = ['Your projects', 'Your company context', 'Billing', 'Connect your Claude'];
		expect(labelsFor(clientContact)).toEqual(portalLabels);
		expect(labelsFor(clientAdministrator)).toEqual([...portalLabels, 'People']);
	});

	it('marks the link the page sits under most closely and heads the page with it', () => {
		const patchView = viewAt(staff, '/clients/patches/patch-1');
		expect(patchView.currentHref).toBe('/clients/patches');
		expect(patchView.trail).toEqual({ crumbs: [], heading: 'Patches' });
		expect(viewAt(clientContact, '/portal/projects/project-1').trail.heading).toBe('Your projects');
		expect(viewAt(clientContact, '/portal/billing').trail.heading).toBe('Billing');
	});

	it('heads the notifications page, and falls back to the company name', () => {
		expect(viewAt(staff, '/notifications').trail.heading).toBe('Notifications');
		expect(viewAt(staff, '/notifications').currentHref).toBe('/notifications');
		expect(viewAt(member, '/clients').trail.heading).toBe('Your Business Today');
	});

	it('sends a client contact home to the portal and signs them out there', () => {
		const portalView = viewAt(clientContact, '/portal');
		expect(portalView.homePath).toBe('/portal');
		expect(portalView.signOutPath).toBe('/portal?/signOut');
		expect(viewAt(staff, '/projects').signOutPath).toBe('/account?/signOut');
	});

	it('puts the picked organisation’s pages and modules first, each link once, and opens home on its projects', () => {
		const organisationLinks = [
			{ href: '/organisations/harbour', label: 'Overview' },
			{ href: '/projects', label: 'Projects' }
		];
		const moduleLinks = [{ href: '/organisations/harbour/books', label: 'Books' }];
		const picks = { ...noPicks, organisationLinks, moduleLinks, homePath: '/projects' };
		const view = frameViewFor(staff, siteUrl('/projects/harbour-site/tasks/one'), picks);
		const labels = view.links.map(({ label }) => label);
		expect(labels.slice(0, 4)).toEqual(['Overview', 'Projects', 'Books', 'Organisations']);
		expect(labels.filter((label) => label === 'Projects')).toHaveLength(1);
		expect(view.currentHref).toBe('/projects');
		expect(view.homePath).toBe('/projects');
	});

	it('keeps today’s home when nothing is picked', () => {
		expect(frameViewFor(staff, siteUrl('/projects'), noPicks).homePath).toBe('/');
		expect(frameViewFor(clientContact, siteUrl('/portal'), noPicks).homePath).toBe('/portal');
	});
});

