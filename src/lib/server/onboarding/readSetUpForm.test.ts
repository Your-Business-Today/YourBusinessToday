import { describe, expect, it } from 'vitest';
import { readSetUpPeople } from './readSetUpForm';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';

const listed = (id: string, name: string, email: string) => ({ id, name, email }) as ClientContact;
const contacts = [listed('contact-1', 'Sam Smith', 'sam@acme.example'), listed('contact-2', 'Alex Jones', 'alex@acme.example')];

function formWith(entries: [string, string][]): FormData {
	const formData = new FormData();
	for (const [field, value] of entries) formData.append(field, value);
	return formData;
}

describe('the set-up form on a client’s page', () => {
	it('reads the people ticked on the list, in its order, then the new person', () => {
		const formData = formWith([
			['contactId', 'contact-2'],
			['contactId', 'contact-1'],
			['newPersonName', 'Jo Bloggs'],
			['newPersonEmail', 'jo@acme.example']
		]);
		expect(readSetUpPeople(formData, contacts)).toEqual([
			{ name: 'Sam Smith', email: 'sam@acme.example' },
			{ name: 'Alex Jones', email: 'alex@acme.example' },
			{ name: 'Jo Bloggs', email: 'jo@acme.example' }
		]);
	});

	it('leaves the new person out when both fields are blank', () => {
		expect(readSetUpPeople(formWith([['contactId', 'contact-1']]), contacts)).toHaveLength(1);
	});

	it('never reads a contact that is not on this client’s list', () => {
		expect(readSetUpPeople(formWith([['contactId', 'contact-elsewhere']]), contacts)).toEqual([]);
	});
});
