import { describe, expect, it } from 'vitest';
import { personResearchRequest } from './personResearchRequest';

const person = { id: '11111111-1111-4111-8111-111111111111', name: 'Ada Lovelace' };

describe('personResearchRequest', () => {
	it('names the person with their id and the two actions their Claude uses', () => {
		const request = personResearchRequest(person);
		expect(request).toContain('Ada Lovelace (person 11111111-1111-4111-8111-111111111111');
		expect(request).toContain('read_person');
		expect(request).toContain('save_person_research');
	});
});
