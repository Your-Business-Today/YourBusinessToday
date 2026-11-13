import { describe, expect, it } from 'vitest';
import { findStaffMember } from './findStaffMember';

const nigel = { id: 'nigel', name: 'Nigel Reilly', email: 'nigel.reilly@jewelenterprises.co.uk' };
const james = { id: 'james', name: 'James Beadle', email: 'james@yourbusiness.today' };
const jamesTwo = { id: 'james-two', name: 'James Other', email: 'james.other@example.com' };

describe('findStaffMember', () => {
	it('finds a staff member by their whole name, whatever the case', () => {
		expect(findStaffMember([nigel, james], 'nigel reilly')).toEqual(nigel);
	});

	it('finds a staff member by their first name when only one has it', () => {
		expect(findStaffMember([nigel, james], 'Nigel')).toEqual(nigel);
	});

	it('finds a staff member by their email, whatever the case', () => {
		expect(findStaffMember([nigel, james], 'Nigel.Reilly@jewelenterprises.co.uk')).toEqual(nigel);
	});

	it('finds nobody when two share the first name given', () => {
		expect(findStaffMember([nigel, james, jamesTwo], 'James')).toBeNull();
	});

	it('finds nobody when no one has the name', () => {
		expect(findStaffMember([nigel, james], 'Jeremy')).toBeNull();
	});
});
