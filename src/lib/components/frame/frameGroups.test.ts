import { describe, expect, it } from 'vitest';
import { frameSectionsOf, type FrameLink } from './frameGroups';

const sideBarLinks: FrameLink[] = [
	{ href: '/organisations/harbour', label: 'Overview', icon: 'layoutDashboard' },
	{ href: '/projects', label: 'Projects', icon: 'folderKanban', group: 'work' },
	{ href: '/organisations/harbour/task-management', label: 'Tasks', icon: 'listChecks', group: 'work' },
	{ href: '/organisations/harbour/books', label: 'Reports', icon: 'chartColumn', group: 'accounts' },
	{ href: '/organisations/harbour/brand', label: 'Brand', icon: 'swatchBook', group: 'more' },
	{ href: '/organisations/harbour/business-brain', label: 'Your Business Brain', icon: 'brain', group: 'knowledge' },
	{ href: '/leads', label: 'Leads', icon: 'target', group: 'sales' },
	{ href: '/clients', label: 'Clients', icon: 'building', group: 'sales' }
];

const foldersOf = (links: FrameLink[]) =>
	frameSectionsOf(links).map(({ folder, links: sectionLinks }) => [folder?.label ?? null, sectionLinks.map(({ label }) => label)]);

describe('frameSectionsOf', () => {
	it('puts Overview on top, then Work, Sales, Accounts and Knowledge, then the rest', () => {
		expect(foldersOf(sideBarLinks)).toEqual([
			[null, ['Overview']],
			['Work', ['Projects', 'Tasks']],
			['Sales', ['Leads', 'Clients']],
			['Accounts', ['Reports']],
			['Knowledge', ['Your Business Brain']],
			[null, ['Brand']]
		]);
	});

	it('leaves out a folder with nothing in it, so a module switched off takes its folder with it', () => {
		const withoutModules = sideBarLinks.filter(({ href }) => !href.startsWith('/organisations/harbour/b'));
		expect(foldersOf(withoutModules).map(([label]) => label)).toEqual([null, 'Work', 'Sales']);
	});

	it('keeps links that name no folder as plain links at the top, as the portal’s are', () => {
		expect(foldersOf([{ href: '/portal', label: 'Your projects', icon: 'folderKanban' }])).toEqual([[null, ['Your projects']]]);
	});

	it('draws each folder and each link with its own icon', () => {
		const [top, work] = frameSectionsOf(sideBarLinks);
		expect(top.links).toEqual([{ href: '/organisations/harbour', label: 'Overview', icon: 'layoutDashboard' }]);
		expect(work.folder).toEqual({ label: 'Work', icon: 'briefcase' });
		expect(work.links.map(({ icon }) => icon)).toEqual(['folderKanban', 'listChecks']);
	});
});
