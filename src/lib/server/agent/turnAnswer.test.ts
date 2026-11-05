import { describe, expect, it } from 'vitest';
import { validateTurnAnswer } from './turnAnswer';
import { outcomeRefusal } from './turnOutcome';

const today = '2026-11-05';

describe('reading the person’s answer to a turn', () => {
	it('takes an answer with its words', () => {
		const answer = validateTurnAnswer({ itemKey: 'message:1', outcome: 'answered', text: 'The key is in 1Password' }, today);
		expect(answer).toEqual({
			itemKey: 'message:1', outcome: 'answered', text: 'The key is in 1Password', fault: null, untilDay: null
		});
	});

	it('refuses an answer with no words, a fault on a pass, and a day already gone', () => {
		expect(validateTurnAnswer({ itemKey: 'task:1', outcome: 'started' }, today)).toContain('text');
		expect(validateTurnAnswer({ itemKey: 'task:1', outcome: 'confirmed', text: 'ok', fault: 'x' }, today)).toContain('fault');
		expect(validateTurnAnswer({ itemKey: 'task:1', outcome: 'failed', text: 'saw an error' }, today)).toContain('fault');
		expect(validateTurnAnswer({ itemKey: 'todo:1', outcome: 'snoozed', untilDay: today }, today)).toContain('after today');
	});

	it('refuses an outcome it does not know', () => {
		expect(validateTurnAnswer({ itemKey: 'task:1', outcome: 'maybe' }, today)).toContain('outcome is one of');
	});

	it('lets a person only put off a chase', () => {
		expect(outcomeRefusal('chase', 'answered')).toContain('snoozed');
		expect(outcomeRefusal('chase', 'snoozed')).toBeNull();
	});
});
