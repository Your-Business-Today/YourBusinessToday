import { describe, expect, it } from 'vitest';
import { mostSubtasksRaisedAtOnce, subtasksRefusal, validateSubtasks } from './subtasksField';

describe('validateSubtasks', () => {
	it('leaves the chunks out when none are given', () => {
		expect(validateSubtasks({})).toEqual({ subtasks: undefined });
	});

	it('takes each chunk with its title and details, in order', () => {
		const subtasks = [{ title: 'Statement layout', details: 'The PDF' }, { title: 'Month-end send' }];
		expect(validateSubtasks({ subtasks })).toEqual({
			subtasks: [
				{ title: 'Statement layout', details: 'The PDF' },
				{ title: 'Month-end send', details: '' }
			]
		});
	});

	it('refuses an empty list, too many chunks, a chunk with no title and a field it does not take', () => {
		const tooMany = Array.from({ length: mostSubtasksRaisedAtOnce + 1 }, () => ({ title: 'Chunk' }));
		const refused = { refusal: subtasksRefusal };
		expect(validateSubtasks({ subtasks: [] })).toEqual(refused);
		expect(validateSubtasks({ subtasks: tooMany })).toEqual(refused);
		expect(validateSubtasks({ subtasks: [{ details: 'No title' }] })).toEqual(refused);
		expect(validateSubtasks({ subtasks: [{ title: 'Chunk', owner: 'James' }] })).toEqual(refused);
		expect(validateSubtasks({ subtasks: 'one, two' })).toEqual(refused);
	});
});
