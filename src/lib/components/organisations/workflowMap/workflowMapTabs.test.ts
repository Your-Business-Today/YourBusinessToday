import { describe, expect, it } from 'vitest';
import { juneAfter, juneBefore, productNames } from './tests/juneBeforeAndAfter';
import { workflowMapTabsOf } from './workflowMapTabs';

const before = juneBefore();
const after = juneAfter();

describe('the page’s one row of tabs', () => {
	const keysOf = (tabs: { key: string }[] | null) => tabs?.map((tab) => tab.key) ?? null;

	it('shows Questions with its count last, even beside a single map', () => {
		const tabs = workflowMapTabsOf({ before, after: null, productNames }, 0, 5);
		expect(keysOf(tabs)).toEqual(['before', 'questions']);
		expect(tabs?.[1]).toMatchObject({ label: 'Questions', count: 5 });
		const allTabs = ['before', 'after', 'changes', 'products', 'people', 'questions'];
		expect(keysOf(workflowMapTabsOf({ before, after, productNames }, 6, 0))).toEqual(allTabs);
	});

	it('shows no row for a Before alone where the page asks no questions', () => {
		expect(workflowMapTabsOf({ before, after: null, productNames }, 0, null)).toBeNull();
	});

	it('shows Products and People in the loop with their counts once an After is filed, before Questions', () => {
		const tabs = workflowMapTabsOf({ before: null, after, productNames }, 0, null);
		expect(keysOf(tabs)).toEqual(['after', 'products', 'people']);
		expect(tabs?.[1]).toMatchObject({ label: 'Products' });
		expect(tabs?.[2]).toMatchObject({ label: 'People in the loop' });
		expect(keysOf(workflowMapTabsOf({ before, after, productNames }, 6, null))).toEqual(['before', 'after', 'changes', 'products', 'people']);
	});
});
