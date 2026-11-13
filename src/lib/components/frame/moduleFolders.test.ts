import { describe, expect, it } from 'vitest';
import { frameSectionsOf } from './frameGroups';
import { domainFrameLink, keepsTheDomain, moduleFrameLink, workflowMapFrameLink } from './moduleFolders';

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
