import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parsePremisesRecord } from './premisesRecord';
import { premisesRowOf } from './premisesTable.fixture';
import type { SupabaseClient } from '@supabase/supabase-js';

type Asked = { door: string; sent: Record<string, unknown> };

const { made } = vi.hoisted(() => ({ made: vi.fn() }));
vi.mock('$lib/server/clients/createClient', () => ({ createClient: made }));

const { addPremisesAsLead } = await import('./addPremisesAsLead');

const answers = vi.fn();
const asked: Asked[] = [];
const rpc = async (door: string, sent: Record<string, unknown>) => (asked.push({ door, sent }), answers());
const supabase = { rpc } as unknown as SupabaseClient;
const lamb = parsePremisesRecord(premisesRowOf());
const territoryId = 'surbiton-id';
const staffId = 'staff-1';
const tie = { door: 'tie_premises_to_client', sent: { premises_id: lamb.id, lead_client_id: 'client-1' } };
const placeListing = (website: string) => parsePremisesRecord(premisesRowOf({ source: 'places_dataset', website }));

describe('adding a premises as a lead', () => {
	beforeEach(() => {
		asked.length = 0;
		vi.clearAllMocks();
		made.mockResolvedValue('client-1');
		answers.mockResolvedValue({ data: null, error: null });
	});

	it('makes the lead, ties the premises to it through the one door, and tells the feed', async () => {
		expect(await addPremisesAsLead(supabase, lamb, territoryId, staffId)).toEqual({ clientId: 'client-1', wasAlreadyListed: false });
		const feed = { door: 'record_area_event', sent: expect.objectContaining({ event_kind: 'lead_added_from_premises', event_client_id: 'client-1', event_detail: 'The Lamb' }) };
		expect(asked).toEqual([tie, feed]);
	});

	it('files a food business under the Food Standards Agency, which lists no website', async () => {
		await addPremisesAsLead(supabase, lamb, territoryId, staffId);
		expect(made).toHaveBeenCalledWith(supabase, expect.objectContaining({ name: 'The Lamb', source: 'food_hygiene', website: '' }), staffId);
	});

	it('files a trading place under the places dataset, with the website it lists as its own', async () => {
		await addPremisesAsLead(supabase, placeListing('https://thelamb.example/'), territoryId, staffId);
		expect(made).toHaveBeenCalledWith(supabase, expect.objectContaining({ source: 'places_dataset', website: 'https://thelamb.example/' }), staffId);
	});

	it.each(['https://www.facebook.com/thelambsurbiton', 'www.thelamb.example', 'javascript:alert(1)'])('gives the lead no website when the place lists %s, which is no site of its own', async (listed) => {
		await addPremisesAsLead(supabase, placeListing(listed), territoryId, staffId);
		expect(made).toHaveBeenCalledWith(supabase, expect.objectContaining({ source: 'places_dataset', website: '' }), staffId);
	});

	it('stops, telling the feed nothing, when the database will not tie the premises', async () => {
		answers.mockResolvedValue({ data: null, error: new Error('That premises is not held, or is a lead already, so nothing was tied.') });
		await expect(addPremisesAsLead(supabase, lamb, territoryId, staffId)).rejects.toThrow('nothing was tied');
		expect(asked).toEqual([tie]);
	});

	it('keeps the client of a premises that is a lead already, making and tying nothing', async () => {
		const alreadyALead = parsePremisesRecord(premisesRowOf({ client_id: 'client-7' }));
		expect(await addPremisesAsLead(supabase, alreadyALead, territoryId, staffId)).toEqual({ clientId: 'client-7', wasAlreadyListed: true });
		expect(made).not.toHaveBeenCalled();
		expect(asked).toEqual([]);
	});
});
