import { describe, expect, it } from 'vitest';
import { validateDecisionAnswer } from './validateDecisionAnswer';
import { validateDecisionRule } from './validateDecisionRule';
import { boardDecisionLimits, boardDecisionRefusals } from './boardroomDecisionRules';

const ownRule = { quorum: 3, agreement: 'unanimous', chairHasCastingVote: false, articlesReference: 'Articles 9 to 12' };

describe('a director’s answer and a company’s own rule are checked against their columns, never repaired', () => {
	it('takes agrees, disagrees or abstains, with a reason only when one is given', () => {
		expect(validateDecisionAnswer({ itemNumber: 1, answer: 'abstains', reason: '  ' })).toEqual({ itemNumber: 1, answer: 'abstains', reason: null });
		expect(validateDecisionAnswer({ itemNumber: 1, answer: 'yes' })).toBe(boardDecisionRefusals.answerUnknown);
		expect(validateDecisionAnswer({ itemNumber: 0, answer: 'agrees' })).toBe(boardDecisionRefusals.itemNumberNotANumber);
	});

	it('refuses a reason longer than its column rather than cutting it', () => {
		const reason = 'a'.repeat(boardDecisionLimits.longestReason + 1);
		expect(validateDecisionAnswer({ itemNumber: 1, answer: 'agrees', reason })).toBe(boardDecisionRefusals.reasonTooLong);
	});

	it('records a company’s own rule with where its articles say it', () => {
		expect(validateDecisionRule(ownRule)).toEqual({ source: 'own_articles', quorum: 3, agreement: 'unanimous', hasChairCastingVote: false, articlesReference: 'Articles 9 to 12' });
		expect(validateDecisionRule({ ...ownRule, quorum: 21 })).toBe(boardDecisionRefusals.quorumNotANumber);
		expect(validateDecisionRule({ ...ownRule, chairHasCastingVote: 'yes' })).toBe(boardDecisionRefusals.castingVoteNotAnAnswer);
		expect(validateDecisionRule({ ...ownRule, articlesReference: '' })).toBe(boardDecisionRefusals.articlesReferenceMissing);
	});
});
