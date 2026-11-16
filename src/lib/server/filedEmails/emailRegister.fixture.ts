import type { SupabaseClient } from '@supabase/supabase-js';

/** The rows a fake register answers with, table by table, and the filters it was asked. */
export type FakeRegister = { rows: Record<string, unknown[]>; filtersAsked: Record<string, string> };

/** A stand-in for the database that answers every select on a table with that table's rows, keeping the filter it was given. */
export function fakeRegisterClient(register: FakeRegister): SupabaseClient {
	const from = (table: string) => ({
		select: () => ({
			or: async (filter: string) => {
				register.filtersAsked[table] = filter;
				return { data: register.rows[table] ?? [], error: null };
			}
		})
	});
	return { from } as unknown as SupabaseClient;
}

export const acmeLtd = { id: 'client-acme', name: 'Acme Ltd', lifecycle_stage: 'lead' };

export const joAtAcme = { id: 'person-jo', name: 'Jo Bloggs', email: 'Jo@Acme.co.uk', client_contacts: [{ clients: acmeLtd }] };

export const samOnNoCompany = { id: 'person-sam', name: 'Sam Rivers', email: 'sam@gmail.com', client_contacts: [] };

export const acmeWebsite = { ...acmeLtd, website: 'https://www.acme.co.uk/contact' };

export const notAcmeWebsite = { id: 'client-not-acme', name: 'Not Acme', lifecycle_stage: 'client', website: 'notacme.co.uk' };
