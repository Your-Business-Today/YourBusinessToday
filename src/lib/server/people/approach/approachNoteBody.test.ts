import { describe, expect, it } from 'vitest';
import { approachNoteBody } from './approachNoteBody';

describe('approachNoteBody', () => {
	it('lays the opening message above the call plan, each under its heading', () => {
		const approach = { personId: 'a', openingMessage: 'Hello Ada.', callPlan: 'Ask for twenty minutes.' };
		expect(approachNoteBody(approach)).toBe('Opening message\nHello Ada.\n\nCall plan\nAsk for twenty minutes.');
	});
});
