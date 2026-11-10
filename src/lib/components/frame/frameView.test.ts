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
	projectLinks: [],
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
		expect(patchView.heading).toBe('Patches');
		expect(viewAt(clientContact, '/portal/projects/project-1').heading).toBe('Your projects');
		expect(viewAt(clientContact, '/portal/billing').heading).toBe('Billing');
	});

	it('heads the notifications page, and falls back to the company name', () => {
		expect(viewAt(staff, '/notifications').heading).toBe('Notifications');
		expect(viewAt(staff, '/notifications').currentHref).toBe('/notifications');
		expect(viewAt(member, '/clients').heading).toBe('Your Business Today');
	});

	it('sends a client contact home to the portal and signs them out there', () => {
		const portalView = viewAt(clientContact, '/portal');
		expect(portalView.homePath).toBe('/portal');
		expect(portalView.signOutPath).toBe('/portal?/signOut');
		expect(viewAt(staff, '/projects').signOutPath).toBe('/account?/signOut');
	});

	it('puts the picked project’s pages and modules first, and opens home on the project', () => {
		const projectLinks = [{ href: '/projects/harbour-site', label: 'Home' }];
		const moduleLinks = [{ href: '/organisations/harbour/books', label: 'Books' }];
		const picks = { ...noPicks, projectLinks, moduleLinks, homePath: '/projects/harbour-site' };
		const view = frameViewFor(staff, siteUrl('/projects/harbour-site/tasks/one'), picks);
		expect(view.links.slice(0, 3).map(({ label }) => label)).toEqual(['Home', 'Books', 'Projects']);
		expect(view.currentHref).toBe('/projects/harbour-site');
		expect(view.homePath).toBe('/projects/harbour-site');
	});

	it('keeps today’s home when nothing is picked', () => {
		expect(frameViewFor(staff, siteUrl('/projects'), noPicks).homePath).toBe('/');
		expect(frameViewFor(clientContact, siteUrl('/portal'), noPicks).homePath).toBe('/portal');
	});
});

