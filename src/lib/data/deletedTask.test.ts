import { describe, expect, it } from 'vitest';
import { whatComesBack } from './deletedTask';

describe('what putting a deleted task back says comes back', () => {
	it('says the task comes back with its id, conversation and history', () => {
		const said = 'This puts “Rods” back on the board with the id it had, its conversation and its history.';
		expect(whatComesBack('Rods', [])).toBe(said);
	});

	it('says plainly that its attached files do not come back', () => {
		expect(whatComesBack('Rods', ['rod.png'])).toContain(
			'Its attached file does not come back: it went from storage with the task.'
		);
		expect(whatComesBack('Rods', ['a.png', 'b.png', 'c.png'])).toContain(
			'Its 3 attached files do not come back: they went from storage with the task.'
		);
	});
});
