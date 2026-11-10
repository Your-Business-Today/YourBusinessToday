import { describe, expect, it } from 'vitest';
import { saveJobAdverts } from './saveJobAdverts';
import type { SupabaseClient } from '@supabase/supabase-js';

const clientId = '11111111-1111-4111-8111-111111111111';
const accountId = '22222222-2222-4222-8222-222222222222';
const surveyor = { title: 'Quantity Surveyor', url: 'https://www.reed.co.uk/jobs/1', postedOn: '2026-09-30' };
const labourer = { title: 'Site Labourer', url: 'https://uk.indeed.com/viewjob?jk=2', postedOn: '' };

type Upserted = { table: string; rows: unknown[]; options: unknown };

function databaseKeepingOneNew(upserted: Upserted[]): SupabaseClient {
	const from = (table: string) => ({
		upsert: (rows: unknown[], options: unknown) => {
			upserted.push({ table, rows, options });
			return { select: async () => ({ data: [{ id: 'new' }], error: null }) };
		}
	});
	return { from } as unknown as SupabaseClient;
}

describe('saveJobAdverts', () => {
	it('keeps each advert on the client, leaving a page already kept as it was', async () => {
		const upserted: Upserted[] = [];
		const saved = await saveJobAdverts(databaseKeepingOneNew(upserted), { clientId, adverts: [surveyor, labourer] }, accountId);
		expect(saved).toEqual({ newCount: 1, alreadyKeptCount: 1 });
		expect(upserted).toEqual([
			{
				table: 'client_job_adverts',
				rows: [
					{ client_id: clientId, title: surveyor.title, url: surveyor.url, posted_on: '2026-09-30', found_by_account_id: accountId },
					{ client_id: clientId, title: labourer.title, url: labourer.url, posted_on: null, found_by_account_id: accountId }
				],
				options: { onConflict: 'client_id,url', ignoreDuplicates: true }
			}
		]);
	});
});
