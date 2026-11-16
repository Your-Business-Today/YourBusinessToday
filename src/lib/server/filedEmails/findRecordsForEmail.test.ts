import { beforeEach, describe, expect, it } from 'vitest';
import { findRecordsForEmail } from './findRecordsForEmail';
import { acmeLtd, acmeWebsite, fakeRegisterClient, joAtAcme, notAcmeWebsite, samOnNoCompany, type FakeRegister } from './emailRegister.fixture';

const acme = { id: acmeLtd.id, name: acmeLtd.name, stage: 'lead' };
let rows: FakeRegister['rows'];
let filtersAsked: FakeRegister['filtersAsked'];

function find(addresses: string[]) {
	return findRecordsForEmail(fakeRegisterClient({ rows, filtersAsked }), addresses);
}

describe('findRecordsForEmail', () => {
	beforeEach(() => {
		rows = { people: [joAtAcme, samOnNoCompany], clients: [acmeWebsite, notAcmeWebsite] };
		filtersAsked = {};
	});

	it('answers a person held by the address, whatever its case, with the clients they are a contact at', async () => {
		expect(await find(['jo@acme.co.uk'])).toEqual([
			{ address: 'jo@acme.co.uk', kind: 'person', personId: 'person-jo', personName: 'Jo Bloggs', companies: [acme] }
		]);
		expect(filtersAsked.people).toBe('email.ilike.jo@acme.co.uk');
	});

	it('answers a person on no company yet as that person', async () => {
		expect(await find(['sam@gmail.com'])).toEqual([
			{ address: 'sam@gmail.com', kind: 'person', personId: 'person-sam', personName: 'Sam Rivers', companies: [] }
		]);
	});

	it('answers an address nobody holds by the client whose website is at its domain, a part of it included, never one that only mentions it', async () => {
		rows = { ...rows, people: [] };
		const owners = await find(['accounts@acme.co.uk', 'jo@mail.acme.co.uk']);
		expect(owners).toEqual([
			{ address: 'accounts@acme.co.uk', kind: 'website', domain: 'acme.co.uk', companies: [acme] },
			{ address: 'jo@mail.acme.co.uk', kind: 'website', domain: 'mail.acme.co.uk', companies: [acme] }
		]);
	});

	it('never matches a website for a free mail address, and says nobody', async () => {
		rows = { ...rows, people: [] };
		expect(await find(['someone@gmail.com'])).toEqual([{ address: 'someone@gmail.com', kind: 'nobody' }]);
		expect(filtersAsked.clients).toBeUndefined();
	});

	it('answers nobody when neither a person nor a website is held', async () => {
		rows = { people: [], clients: [] };
		expect(await find(['hello@stranger.example'])).toEqual([{ address: 'hello@stranger.example', kind: 'nobody' }]);
	});

	it('answers our own addresses as us, without looking them up', async () => {
		expect(await find(['consulting@yourbusiness.today'])).toEqual([{ address: 'consulting@yourbusiness.today', kind: 'us' }]);
		expect(filtersAsked).toEqual({});
	});

	it('makes a like pattern of an address literal, so its underscore is not a wildcard', async () => {
		rows = { ...rows, people: [] };
		await find(['jo_bloggs@acme.co.uk']);
		expect(filtersAsked.people).toBe('email.ilike.jo\\_bloggs@acme.co.uk');
	});
});
