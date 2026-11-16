import { describe, expect, it } from 'vitest';
import { salespeopleOf } from './organisationSalespeople';

const nigel = { id: 'nigel', name: 'Nigel Reilly', email: 'nigel@jewel.example' };
const jeremy = { id: 'jeremy', name: 'Jeremy Ferendinos', email: 'jeremy@books.example' };
const frank = { id: 'frank', name: 'Frank Stroffolino', email: 'frank@ybt.example' };
const otherNigel = { id: 'other-nigel', name: 'Nigel Reilly', email: 'nigel@ybt.example' };
const staffMembers = [frank, nigel, jeremy, otherNigel];

describe('salespeopleOf', () => {
	it('names only the people on the organisation, never the rest of the staff', () => {
		expect(salespeopleOf([nigel, jeremy], staffMembers, [])).toEqual([nigel, jeremy]);
	});

	it('keeps a staff member who brought in one of its records without being on it, once', () => {
		expect(salespeopleOf([nigel], staffMembers, [frank.id, frank.id, nigel.id, null])).toEqual([nigel, frank]);
	});
});
