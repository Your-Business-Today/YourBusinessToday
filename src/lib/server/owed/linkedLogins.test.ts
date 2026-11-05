import { describe, expect, it } from 'vitest';
import { getLoginsOfPeople } from './linkedLogins';
import type { SupabaseClient } from '@supabase/supabase-js';

type LinkRow = { account_id: string; person_account_id: string };

function supabaseHolding(links: LinkRow[]): SupabaseClient {
	const from = () => ({
		select: () => ({
			in: (column: keyof LinkRow, ids: string[]) =>
				Promise.resolve({ data: links.filter((link) => ids.includes(link[column])), error: null })
		})
	});
	return { from } as unknown as SupabaseClient;
}

describe('a person with several logins', () => {
	const supabase = supabaseHolding([{ account_id: 'jeremy-pfp', person_account_id: 'jeremy' }]);

	it('finds every login from the other login', async () => {
		const logins = await getLoginsOfPeople(supabase, ['jeremy-pfp']);
		expect(logins.get('jeremy-pfp')).toEqual({ personAccountId: 'jeremy', accountIds: ['jeremy', 'jeremy-pfp'] });
	});

	it('finds every login from the main login', async () => {
		const logins = await getLoginsOfPeople(supabase, ['jeremy']);
		expect(logins.get('jeremy')).toEqual({ personAccountId: 'jeremy', accountIds: ['jeremy', 'jeremy-pfp'] });
	});

	it('leaves someone with one login as they are', async () => {
		const logins = await getLoginsOfPeople(supabase, ['nigel']);
		expect(logins.get('nigel')).toEqual({ personAccountId: 'nigel', accountIds: ['nigel'] });
	});
});
