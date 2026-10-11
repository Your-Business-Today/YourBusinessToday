import { describe, expect, it } from 'vitest';
import { invoicingDetailsOf } from './organisationInvoicing';
import { emptyAccountsContact } from './organisationRules';

const jewelEnterprises = {
	name: 'Jewel Enterprises',
	address: 'Jewel House, London',
	accountsContact: { name: 'Jeremy Ferendinos', email: 'accounts@jewel.example', phone: '020 7000 0000' }
};

describe('how a sub-organisation is invoiced', () => {
	it('uses the parent’s details where the sub-organisation has none of its own', () => {
		const bespokeBuild = { name: 'Jewel Bespoke Build', address: '', accountsContact: emptyAccountsContact };
		const invoicing = invoicingDetailsOf(bespokeBuild, jewelEnterprises);
		expect(invoicing.name).toBe('Jewel Bespoke Build');
		expect(invoicing.address).toBe('Jewel House, London');
		expect(invoicing.accountsContact).toEqual(jewelEnterprises.accountsContact);
		expect(invoicing.inheritedFields).toEqual(['address', 'contactName', 'contactEmail', 'contactPhone']);
	});

	it('keeps each detail the sub-organisation sets, so it can be invoiced separately', () => {
		const passiveFire = {
			name: 'Jewel Passive Fire Protection',
			address: '',
			accountsContact: { name: 'Stuart Barrance', email: 'accounts@jewelpfp.example', phone: '' }
		};
		const invoicing = invoicingDetailsOf(passiveFire, jewelEnterprises);
		expect(invoicing.address).toBe('Jewel House, London');
		expect(invoicing.accountsContact).toEqual({
			name: 'Stuart Barrance',
			email: 'accounts@jewelpfp.example',
			phone: '020 7000 0000'
		});
		expect(invoicing.inheritedFields).toEqual(['address', 'contactPhone']);
	});

	it('inherits nothing from a parent that has nothing to give', () => {
		const bareParent = { name: 'Jewel Enterprises', address: '', accountsContact: emptyAccountsContact };
		const propertyServe = { name: 'Jewel Property Serve', address: '', accountsContact: emptyAccountsContact };
		expect(invoicingDetailsOf(propertyServe, bareParent).inheritedFields).toEqual([]);
	});

	it('is the organisation’s own details when it stands on its own', () => {
		const invoicing = invoicingDetailsOf(jewelEnterprises, null);
		expect(invoicing).toEqual({ ...jewelEnterprises, inheritedFields: [] });
	});
});
