import { describe, expect, it } from 'vitest';
import { describeBoardroom } from './describeBoardroom';
import { directorListSentence, type BoardroomDirector } from './boardroomDirector';
import { directorNameMaximumLength, directorNameRefusal } from './boardroomDirectorRules';

const jeremy: BoardroomDirector = {
	id: 'seat-1',
	organisationId: 'ybt',
	accountId: 'jeremy',
	name: 'Jeremy',
	namedAt: '2026-11-10T12:00:00.000Z',
	stoodDownAt: null
};
const nigelStoodDown: BoardroomDirector = { ...jeremy, id: 'seat-2', accountId: null, name: 'Nigel', stoodDownAt: '2026-12-01T12:00:00.000Z' };

describe('the boardroom as a director enters it', () => {
	it('names the sitting directors, and keeps a stood-down director by name', () => {
		const description = describeBoardroom('Your Business Today', [jeremy, nigelStoodDown]);
		expect(description).toContain('- Jeremy, director since 10 Nov 2026');
		expect(description).toContain('Stood down:\n- Nigel, director from 10 Nov 2026 to 1 Dec 2026');
	});

	it('lists only the sitting directors where an organisation is read', () => {
		expect(directorListSentence([jeremy, nigelStoodDown])).toBe('Jeremy');
		expect(directorListSentence([nigelStoodDown])).toBe('none named yet');
	});
});

describe("a director's name", () => {
	it('is refused, never cut, when it is longer than its column holds', () => {
		expect(directorNameRefusal('a'.repeat(directorNameMaximumLength))).toBeNull();
		expect(directorNameRefusal('a'.repeat(directorNameMaximumLength + 1))).not.toBeNull();
	});
});
