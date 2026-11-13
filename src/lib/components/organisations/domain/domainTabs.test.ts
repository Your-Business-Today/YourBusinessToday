import { describe, expect, it } from 'vitest';
import type { OrganisationDomain } from '$lib/data/organisationDomain';
import { domainTabKeys, domainTabOf, domainTabsFor, domainThingHref } from './domainTabs';

const pageAt = (search: string) => new URL(`https://www.yourbusiness.today/organisations/org-1/domain${search}`);

const domainWithNothingFiled = { things: [], rules: [], glossaries: [] } as unknown as OrganisationDomain;

describe('the tabs of the Domain page', () => {
	it('opens on Map when the address names no tab, or one the page does not have', () => {
		expect(domainTabOf(pageAt(''))).toBe(domainTabKeys.map);
		expect(domainTabOf(pageAt('?tab=people'))).toBe(domainTabKeys.map);
	});

	it('opens on the tab the address names', () => {
		expect(domainTabOf(pageAt('?tab=things'))).toBe(domainTabKeys.things);
		expect(domainTabOf(pageAt('?tab=words'))).toBe(domainTabKeys.words);
		expect(domainTabOf(pageAt('?tab=questions'))).toBe(domainTabKeys.questions);
	});

	it('opens a thing on the Things tab, whatever the default', () => {
		expect(domainTabOf(pageAt(domainThingHref('work-order')))).toBe(domainTabKeys.things);
	});

	it('shows Map first, then Things, Rules, Words and Questions last, counting the questions open', () => {
		const tabs = domainTabsFor(domainWithNothingFiled, [], 3);
		expect(tabs.map(({ label, href, count }) => [label, href, count])).toEqual([
			['Map', '?tab=map', null],
			['Things', '?tab=things', null],
			['Rules', '?tab=rules', null],
			['Words', '?tab=words', null],
			['Questions', '?tab=questions', 3]
		]);
	});
});
