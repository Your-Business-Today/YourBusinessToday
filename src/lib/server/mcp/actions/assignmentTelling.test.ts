import { describe, expect, it } from 'vitest';
import { assignmentTelling } from './assignmentTelling';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

const person = (id: string, name: string) => ({ id, name }) as unknown as ProjectPerson;
const people = [person('jeremy', 'Jeremy'), person('nigel', 'Nigel'), person('james', 'James')];
const title = 'Review the cashflow forecast';

describe('what an assignment answers', () => {
	it('names both people when a second is added, and that each was told', () => {
		const told = assignmentTelling({ title, people, beforeIds: ['nigel'], afterIds: ['nigel', 'james'], callerId: 'jeremy' });
		expect(told).toContain('is now with Nigel, James.');
		expect(told).toContain('James told on their bell');
		expect(told).not.toContain('Taken off');
	});

	it('says plainly who a replacing list took off', () => {
		const told = assignmentTelling({ title, people, beforeIds: ['nigel'], afterIds: ['james'], callerId: 'jeremy' });
		expect(told).toContain('Taken off it: Nigel.');
	});

	it('tells nobody when the caller puts themselves on the task', () => {
		const told = assignmentTelling({ title, people, beforeIds: [], afterIds: ['jeremy'], callerId: 'jeremy' });
		expect(told).toBe(`"${title}" is now with Jeremy.`);
	});
});
