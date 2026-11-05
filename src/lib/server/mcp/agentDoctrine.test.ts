import { describe, expect, it } from 'vitest';
import { workingDoctrine } from './workingDoctrine';

describe('the YBT agent’s script in the working doctrine', () => {
	it('works one item per turn through next_turn and answer_turn', () => {
		expect(workingDoctrine).toContain('one item per turn');
		expect(workingDoctrine).toContain('call next_turn');
		expect(workingDoctrine).toContain('record it with answer_turn');
	});

	it('leaves the person to start and keeps the full list for "show me everything"', () => {
		expect(workingDoctrine).toContain('The person always starts the conversation');
		expect(workingDoctrine).toContain('"show me everything"');
		expect(workingDoctrine).toContain('read_project_state');
	});
});
