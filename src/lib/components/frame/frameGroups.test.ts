import { describe, expect, it } from 'vitest';
import { frameSectionsOf, type FrameLink } from './frameGroups';

const sideBarLinks: FrameLink[] = [
	{ href: '/organisations/harbour', label: 'Overview' },
	{ href: '/projects', label: 'Projects', group: 'work' },
	{ href: '/organisations/harbour/task-management', label: 'Tasks', group: 'work' },
	{ href: '/organisations/harbour/books', label: 'Reports', group: 'accounts' },
	{ href: '/organisations/harbour/brand', label: 'Brand', group: 'more' },
	{ href: '/organisations/harbour/business-brain', label: 'Your Business Brain', group: 'knowledge' },
	{ href: '/leads', label: 'Leads', group: 'sales' },
	{ href: '/clients', label: 'Clients', group: 'sales' }
];

const foldersOf = (links: FrameLink[]) =>
	frameSectionsOf(links).map(({ label, links: sectionLinks }) => [label, sectionLinks.map(({ label: linkLabel }) => linkLabel)]);

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
		expect(foldersOf([{ href: '/portal', label: 'Your projects' }])).toEqual([[null, ['Your projects']]]);
	});
});
