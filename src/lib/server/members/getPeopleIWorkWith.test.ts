import { describe, expect, it } from 'vitest';
import { getPeopleIWorkWith } from './getPeopleIWorkWith';
import type { SupabaseClient } from '@supabase/supabase-js';

const nigel = { id: 'nigel', email: 'nigel@example.com', display_name: 'Nigel' };

function serviceClientAnswering(rows: Record<string, unknown>[]) {
	const calls: { name: string; parameters: unknown }[] = [];
	const rpc = async (name: string, parameters: unknown) => {
		calls.push({ name, parameters });
		return { data: rows, error: null };
	};
	return { client: { rpc } as unknown as SupabaseClient, calls };
}

describe('the people someone works with', () => {
	it('asks the database about the person named, since the connector has no signed-in person', async () => {
		const service = serviceClientAnswering([nigel]);
		const colleagues = await getPeopleIWorkWith(service.client, 'james');
		expect(service.calls).toEqual([{ name: 'people_working_with', parameters: { member: 'james' } }]);
		expect(colleagues.map((colleague) => colleague.email)).toEqual([nigel.email]);
	});
});
