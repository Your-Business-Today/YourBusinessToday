import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractPack } from '$lib/data/contractPack';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));

const clientId = '00000000-0000-4000-8000-0000000000c1';
const contactsAtClient: ClientContact[] = [];

vi.mock('./contractPackTables', () => ({ findClientIdForOrganisation: async () => clientId, contractPackTable: 'contract_packs' }));
vi.mock('$lib/server/clients/getContactsForClient', () => ({ getContactsForClient: async () => contactsAtClient }));

const { planPackSending } = await import('./packSendingPlan');

const contact = (id: string, name: string, email: string, accountId: string | null = 'account') => ({ id, name, email, accountId }) as ClientContact;
const main = contact('00000000-0000-4000-8000-0000000000a1', 'Ada Lane', 'ada@harbour.example');
const signatory = contact('00000000-0000-4000-8000-0000000000a2', 'Sam Shah', 'sam@harbour.example');
const organisation = { id: 'organisation', name: 'Harbour Dental', signatoryEmail: 'Sam@Harbour.example' } as Organisation;
const supabase = {} as SupabaseClient;

const pack = (stage = 'drafted', openBlanks: string[] = []) =>
	({ id: 'pack', stage, documents: [{ documentId: 'document', title: 'Order Form', versionNumber: 2, openBlanks, signature: null }] }) as unknown as ContractPack;

describe('planning the sending of a client pack', () => {
	it('sends to the signatory by default, with one link to the pack in the portal and each document with its version', async () => {
		contactsAtClient.splice(0, contactsAtClient.length, main, signatory);
		const plan = await planPackSending(supabase, organisation, pack(), null);
		expect(plan).toMatchObject({
			from: 'Your Business Today <hello@yourbusiness.today>',
			contact: { name: 'Sam Shah', email: 'sam@harbour.example' },
			documents: [{ title: 'Order Form', versionNumber: 2 }],
			packUrl: `https://portal.yourbusiness.today/portal/contract?organisation=${clientId}`
		});
	});

	it('sends to the main contact when no contact has the signatory email, and to the one named when one is', async () => {
		contactsAtClient.splice(0, contactsAtClient.length, main);
		expect(await planPackSending(supabase, organisation, pack(), null)).toMatchObject({ contact: { name: 'Ada Lane' } });
		contactsAtClient.splice(0, contactsAtClient.length, main, signatory);
		expect(await planPackSending(supabase, organisation, pack(), main.id)).toMatchObject({ contact: { name: 'Ada Lane' } });
	});

	it('refuses a pack already signed, a document with a blank still open, and a contact who cannot open the portal', async () => {
		contactsAtClient.splice(0, contactsAtClient.length, main);
		expect(await planPackSending(supabase, organisation, pack('signed_by_client'), null)).toContain('signed this pack already');
		expect(await planPackSending(supabase, organisation, pack('drafted', ['Start date']), null)).toContain('Order Form ([Start date])');
		contactsAtClient.splice(0, contactsAtClient.length, contact(main.id, 'Ada Lane', 'ada@harbour.example', null));
		expect(await planPackSending(supabase, organisation, pack(), null)).toContain('invite_client_contact');
		contactsAtClient.splice(0, contactsAtClient.length, contact(main.id, 'Ada Lane', ''));
		expect(await planPackSending(supabase, organisation, pack(), null)).toContain('no email address');
		expect(await planPackSending(supabase, organisation, pack(), signatory.id)).toContain('No contact at Harbour Dental');
	});
});
