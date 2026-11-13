import { describe, expect, it, vi } from 'vitest';
import { actionsFor } from './actionRegistry';
import type { AccountStanding } from './resolveAccountStanding';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const anAdministrator = { isAdmin: true, isStaff: true } as AccountStanding;

const retiredActions = [
	'change_product_brain',
	'read_product_brain_index',
	'search_product_brain',
	'read_product_brain_page',
	'start_product_brain_domain_run',
	'file_product_brain_domain',
	'read_product_brain_domain'
];

const keptActions = ['read_project_domain', 'search_my_brains', 'read_business_brain_domain', 'start_business_brain_domain_run'];

describe('the product brain and the product domain, retired', () => {
	const offeredNames = actionsFor(anAdministrator, null).map((action) => action.name);

	it('offers none of their actions, even to an administrator', () => {
		expect(offeredNames.filter((name) => retiredActions.includes(name))).toEqual([]);
	});

	it("keeps the repository's domain, the organisation's domain and the search across brains", () => {
		expect(keptActions.filter((name) => !offeredNames.includes(name))).toEqual([]);
	});
});
