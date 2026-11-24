import { describe, expect, it } from 'vitest';
import { raisingRefusal, validateDecisionClosing, validateDecisionRaising } from './validateChatDecision';
import { chatDecisionLimits, chatDecisionRefusals } from './chatDecisionRules';
import { chatMessageRefusals } from './chatMessageRules';

const messageId = '11111111-1111-4111-8111-111111111111';
const decisionId = '22222222-2222-4222-8222-222222222222';
const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };

describe('validateDecisionRaising', () => {
	it('takes the message, the wording trimmed and who it waits on trimmed', () => {
		expect(validateDecisionRaising({ messageId, wording: ' Do we take the Leeds job? ', waitingOn: ' nigel ' })).toEqual({
			messageId,
			wording: 'Do we take the Leeds job?',
			waitingOn: 'nigel'
		});
	});

	it('refuses wording that is blank, too long or not text, never cutting it to fit', () => {
		for (const wording of ['  ', 'a'.repeat(chatDecisionLimits.longestWording + 1), 7, undefined]) {
			expect(validateDecisionRaising({ messageId, wording, waitingOn: 'nigel' })).toBe(chatDecisionRefusals.wording);
		}
		expect(validateDecisionRaising({ messageId, wording: 'a'.repeat(chatDecisionLimits.longestWording), waitingOn: 'nigel' })).not.toBeTypeOf('string');
	});

	it('refuses a message that is no id and a decision that waits on no one', () => {
		expect(validateDecisionRaising({ messageId: 'the last one', wording: 'Go?', waitingOn: 'nigel' })).toContain('The message must be an id');
		expect(validateDecisionRaising({ messageId, wording: 'Go?', waitingOn: ' ' })).toBe(chatDecisionRefusals.waitingOn);
		expect(validateDecisionRaising({ messageId, wording: 'Go?' })).toBe(chatDecisionRefusals.waitingOn);
	});
});

describe('validateDecisionClosing', () => {
	it('takes the decision and its outcome trimmed', () => {
		expect(validateDecisionClosing({ decisionId, outcome: ' We take it. ' })).toEqual({ decisionId, outcome: 'We take it.' });
	});

	it('refuses an outcome that is blank, too long or not text, and a decision that is no id', () => {
		for (const outcome of ['', 'a'.repeat(chatDecisionLimits.longestOutcome + 1), false]) {
			expect(validateDecisionClosing({ decisionId, outcome })).toBe(chatDecisionRefusals.outcome);
		}
		expect(validateDecisionClosing({ decisionId: '', outcome: 'Yes.' })).toContain('The decision must be an id');
	});
});

describe('raisingRefusal', () => {
	it('lets a decision be raised in an open room of the organisation only', () => {
		expect(raisingRefusal(finance)).toBeNull();
		expect(raisingRefusal({ ...finance, isArchived: true })).toBe(chatDecisionRefusals.archivedRoom);
		expect(raisingRefusal(undefined)).toBe(chatMessageRefusals.noSuchRoom);
	});
});
