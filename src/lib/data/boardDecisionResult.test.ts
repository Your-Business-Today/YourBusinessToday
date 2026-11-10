import { describe, expect, it } from 'vitest';
import { decisionResultOf, type DecisionCount } from './boardDecisionResult';
import { modelArticlesRule, type DecisionAnswerKind, type DecisionRule } from './boardroomDecision';
import { answered } from './boardroomDecision.fixtures';

function countOf(answers: [string, DecisionAnswerKind][], extra: Partial<DecisionCount> = {}): DecisionCount {
	const given = answers.map(([seat, answer]) => answered(seat, answer));
	return { rule: modelArticlesRule, chairDirectorId: 'chair', answers: given, waitingFor: [], directorsOnMeeting: given.length, ...extra };
}

const ownRule: DecisionRule = { ...modelArticlesRule, source: 'own_articles', agreement: 'unanimous', quorum: 3, articlesReference: 'Article 9' };

describe('how a decision carries by the model articles, unless the company recorded its own', () => {
	it('waits while any director on the meeting has still to answer', () => {
		expect(decisionResultOf(countOf([['a', 'agrees']], { waitingFor: ['b'] }))).toEqual({ isDecided: false, isCarried: false, reason: 'waiting' });
	});

	it('carries by a majority of the directors taking part, abstaining included in who took part', () => {
		const result = decisionResultOf(countOf([['a', 'agrees'], ['b', 'agrees'], ['c', 'disagrees'], ['d', 'abstains']]));
		expect(result).toEqual({ isDecided: true, isCarried: true, reason: 'majority' });
	});

	it('goes the way the chair answered when the votes are equal, on the casting vote', () => {
		const forIt = decisionResultOf(countOf([['chair', 'agrees'], ['b', 'disagrees']]));
		const againstIt = decisionResultOf(countOf([['chair', 'disagrees'], ['b', 'agrees']]));
		expect(forIt).toEqual({ isDecided: true, isCarried: true, reason: 'casting_vote' });
		expect(againstIt).toEqual({ isDecided: true, isCarried: false, reason: 'casting_vote' });
	});

	it('carries nothing on equal votes when the chair abstained or has no casting vote', () => {
		const chairAbstains = countOf([['chair', 'abstains'], ['b', 'agrees'], ['c', 'disagrees']]);
		const noCastingVote = countOf([['chair', 'agrees'], ['b', 'disagrees']], { rule: { ...modelArticlesRule, hasChairCastingVote: false } });
		expect(decisionResultOf(chairAbstains).isCarried).toBe(false);
		expect(decisionResultOf(noCastingVote)).toEqual({ isDecided: true, isCarried: false, reason: 'not_carried' });
	});

	it('lets a board of one director decide alone (model article 7(2))', () => {
		expect(decisionResultOf(countOf([['a', 'agrees']]))).toEqual({ isDecided: true, isCarried: true, reason: 'sole_director' });
	});

	it('carries nothing with fewer taking part than the quorum on a board of two or more', () => {
		const count = countOf([['a', 'agrees']], { directorsOnMeeting: 2 });
		expect(decisionResultOf(count)).toEqual({ isDecided: true, isCarried: false, reason: 'short_of_quorum' });
	});

	it('follows the company’s own rule: every director taking part, and its own quorum', () => {
		const everyOne = countOf([['a', 'agrees'], ['b', 'agrees'], ['c', 'agrees']], { rule: ownRule });
		const oneAbstains = countOf([['a', 'agrees'], ['b', 'agrees'], ['c', 'abstains']], { rule: ownRule });
		expect(decisionResultOf(everyOne)).toEqual({ isDecided: true, isCarried: true, reason: 'every_director' });
		expect(decisionResultOf(oneAbstains).isCarried).toBe(false);
		expect(decisionResultOf(countOf([['a', 'agrees'], ['b', 'agrees']], { rule: ownRule })).reason).toBe('short_of_quorum');
	});
});
