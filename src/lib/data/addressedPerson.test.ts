import { describe, expect, it } from 'vitest';
import { addressedPerson } from './addressedPerson';

const james = { id: 'james', name: 'James Beadle', email: 'james@example.com' };
const jeremy = { id: 'jeremy', name: 'Jeremy Ferendinos', email: 'jeremy@example.com' };
const people = [james, jeremy];

describe('addressedPerson', () => {
	it('finds the person a question opens by greeting', () => {
		expect(addressedPerson('Hi James,\n\nCan you confirm the date?', people, jeremy.id)).toBe(james);
		expect(addressedPerson('Jeremy, could you check the figures?', people, james.id)).toBe(jeremy);
	});

	it('finds nobody when the message asks nothing, names nobody, or names the writer', () => {
		expect(addressedPerson('Hi James,\n\nThe work is merged.', people, jeremy.id)).toBeNull();
		expect(addressedPerson('Merged the fix. Anything else?', people, jeremy.id)).toBeNull();
		expect(addressedPerson('Hi Jeremy, is this right?', people, jeremy.id)).toBeNull();
	});
});
