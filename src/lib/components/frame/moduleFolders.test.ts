import { describe, expect, it } from 'vitest';
import { frameSectionsOf } from './frameGroups';
import { domainFrameLink, keepsTheDomain, moduleFrameLink, moduleFrameLinks, workflowMapFrameLink } from './moduleFolders';

describe('moduleFrameLink', () => {
	it('names each module’s page for its folder', () => {
		expect(moduleFrameLink('books', '/organisations/harbour/books')).toEqual({
			href: '/organisations/harbour/books',
			label: 'Reports',
			icon: 'chartColumn',
			group: 'accounts'
		});
	});
});

describe('moduleFrameLinks', () => {
	it('lists the books’ Invoices and Costs pages after Reports, in the Accounts folder', () => {
		const [accounts] = frameSectionsOf(moduleFrameLinks('books', '/organisations/harbour/books'));
		expect(accounts.folder).toEqual({ label: 'Accounts', icon: 'poundSterling' });
		expect(accounts.links).toEqual([
			{ href: '/organisations/harbour/books', label: 'Reports', icon: 'chartColumn' },
			{ href: '/organisations/harbour/books/invoices', label: 'Invoices', icon: 'fileText' },
			{ href: '/organisations/harbour/books/costs', label: 'Costs', icon: 'receipt' }
		]);
	});

	it('lists a module that keeps no other page by its own page alone', () => {
		expect(moduleFrameLinks('brand', '/organisations/harbour/brand')).toEqual([moduleFrameLink('brand', '/organisations/harbour/brand')]);
	});
});

describe('domainFrameLink and workflowMapFrameLink', () => {
	it('list the organisation’s domain and workflow map under Knowledge, before the brain that keeps them', () => {
		const brainLink = moduleFrameLink('business_brain', '/organisations/harbour/business-brain');
		const [knowledge] = frameSectionsOf([domainFrameLink('harbour'), workflowMapFrameLink('harbour'), brainLink]);
		expect(knowledge.folder).toEqual({ label: 'Knowledge', icon: 'bookOpen' });
		expect(knowledge.links).toEqual([
			{ href: '/organisations/harbour/domain', label: 'Domain', icon: 'network' },
			{ href: '/organisations/harbour/workflow-map', label: 'Workflow map', icon: 'route' },
			{ href: '/organisations/harbour/business-brain', label: 'Your Business Brain', icon: 'brain' }
		]);
	});
});

describe('keepsTheDomain', () => {
	it('is true of Your Business Brain alone', () => {
		expect(keepsTheDomain('business_brain')).toBe(true);
		expect(keepsTheDomain('books')).toBe(false);
	});
});
