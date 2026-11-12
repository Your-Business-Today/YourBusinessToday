import { describe, expect, it } from 'vitest';
import { frameSectionsOf } from './frameGroups';
import { domainFrameLink, keepsTheDomain, moduleFrameLink } from './moduleFolders';

describe('moduleFrameLink', () => {
	it('names each module’s page for its folder', () => {
		expect(moduleFrameLink('books', '/organisations/harbour/books')).toEqual({
			href: '/organisations/harbour/books',
			label: 'Reports',
			group: 'accounts'
		});
	});
});

describe('domainFrameLink', () => {
	it('lists the organisation’s domain under Knowledge, after the brain that keeps it', () => {
		const brainLink = moduleFrameLink('business_brain', '/organisations/harbour/business-brain');
		const [knowledge] = frameSectionsOf([brainLink, domainFrameLink('harbour')]);
		expect(knowledge.label).toBe('Knowledge');
		expect(knowledge.links).toEqual([
			{ href: '/organisations/harbour/business-brain', label: 'Your Business Brain' },
			{ href: '/organisations/harbour/domain', label: 'Domain' }
		]);
	});
});

describe('keepsTheDomain', () => {
	it('is true of Your Business Brain alone', () => {
		expect(keepsTheDomain('business_brain')).toBe(true);
		expect(keepsTheDomain('books')).toBe(false);
	});
});
