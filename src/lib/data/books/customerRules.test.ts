import { describe, expect, it } from 'vitest';
import { validateCustomerChange, validateNewCustomer } from './customerRules';
import { clientLinkPlaceRefusal } from './clientRegisterLink';

describe('the customer rules', () => {
	it('keep a new customer as given, with what was left out empty as the column holds it', () => {
		expect(validateNewCustomer({ name: 'Shop', address: 'Line 1\nLine 2' })).toEqual({ name: 'Shop', contactName: '', email: '', address: 'Line 1\nLine 2' });
	});

	it('need a name for a new customer', () => {
		expect(validateNewCustomer({ email: 'accounts@shop.example' })).toBe('name is needed: it is who every invoice is made out to.');
	});

	it('let an email be emptied, and a change be only the client link', () => {
		expect(validateCustomerChange({ email: '' })).toEqual({ email: '' });
		expect(validateCustomerChange({ clientId: null })).toEqual({});
	});

	it('refuse an archive answer that is not yes or no', () => {
		expect(validateCustomerChange({ isArchived: 'no' })).toContain('isArchived is true to archive the customer');
	});

	it("allow a link to the clients register only for Your Business Today's staff in its own books", () => {
		expect(clientLinkPlaceRefusal({ isStaff: true, organisationName: 'Your Business Today' })).toBeNull();
		expect(clientLinkPlaceRefusal({ isStaff: false, organisationName: 'Your Business Today' })).toContain('staff');
		expect(clientLinkPlaceRefusal({ isStaff: true, organisationName: 'Jewel Enterprises' })).toContain("these are Jewel Enterprises's");
	});
});
