import { describe, expect, it } from 'vitest';
import { personApproachRequest } from './personApproachRequest';

const person = { id: '11111111-1111-4111-8111-111111111111', name: 'Ada Lovelace' };

describe('personApproachRequest', () => {
	it('names the person with their id and the two actions their Claude uses', () => {
		const request = personApproachRequest(person);
		expect(request).toContain('Ada Lovelace (person 11111111-1111-4111-8111-111111111111');
		expect(request).toContain('read_person');
		expect(request).toContain('save_person_approach');
	});
});
