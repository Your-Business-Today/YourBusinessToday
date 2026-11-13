import { describe, expect, it } from 'vitest';
import { validateBankRule } from './bankRuleRules';
import { counterpartyKey, findCoveringRule, findSameRule, statedChoiceRefusal } from './bankRuleTerms';

const softwareId = '00000000-0000-4000-8000-000000006000';
const loanId = '00000000-0000-4000-8000-000000002300';
const adobe = { counterparty: 'ADOBE', direction: 'out', cost: { expenseAccountId: softwareId } };

describe('what a bank rule may say', () => {
	it('keeps a cost rule and a movement rule as given', () => {
		expect(validateBankRule(adobe)).toEqual({
			counterparty: 'ADOBE',
			direction: 'out',
			matchedAs: 'cost',
			accountId: softwareId,
			description: '',
			costCentreId: null
		});
		const loan = { counterparty: ' Beadle EM & GJ ', direction: 'either', account: { accountId: loanId, description: 'Loan from James' } };
		expect(validateBankRule(loan)).toEqual(expect.objectContaining({ counterparty: ' Beadle EM & GJ ', matchedAs: 'account', costCentreId: null }));
	});

	it('refuses each value its columns cannot hold, by name, never trimming it', () => {
		expect(validateBankRule({ ...adobe, counterparty: 'A'.repeat(201) })).toBe('counterparty is at most 200 characters; 201 were given.');
		expect(validateBankRule({ ...adobe, counterparty: '  ' })).toContain('counterparty is needed');
		expect(validateBankRule({ ...adobe, direction: 'sideways' })).toBe('direction is one of in, out, either; "sideways" was given.');
		expect(validateBankRule({ ...adobe, account: { accountId: loanId, description: 'x' } })).toContain('Give exactly one of cost or account');
		expect(validateBankRule({ ...adobe, direction: 'in' })).toBe("A cost is money out, so a cost rule's direction is out; in was given.");
		expect(validateBankRule({ ...adobe, cost: { expenseAccountId: 'software' } })).toContain('The expense account must be an id');
		expect(validateBankRule({ ...adobe, cost: { expenseAccountId: softwareId, description: 'd'.repeat(301) } })).toBe(
			'description is at most 300 characters; 301 were given.'
		);
		const undescribed = { counterparty: 'NIGEL', direction: 'in', account: { accountId: loanId, description: ' ' } };
		expect(validateBankRule(undescribed)).toContain('account.description is needed');
	});

	it('asks for applyNow and applyRules to be stated, true or false', () => {
		expect(statedChoiceRefusal('applyNow', true)).toBeNull();
		expect(statedChoiceRefusal('applyNow', undefined)).toBe('applyNow is true or false, always stated; undefined was given.');
		expect(statedChoiceRefusal('applyRules', 'yes')).toBe('applyRules is true or false, always stated; "yes" was given.');
	});
});

describe('which rule covers a line', () => {
	const either = { id: 'either', counterparty: 'Beadle EM & GJ', direction: 'either' as const };
	const moneyIn = { id: 'in', counterparty: 'BEADLE EM & GJ ', direction: 'in' as const };

	it('matches the counterparty whole, ignoring case and the spaces at its ends', () => {
		expect(counterpartyKey('  Beadle EM & GJ ')).toBe('beadle em & gj');
		expect(findCoveringRule([either], { counterparty: 'BEADLE EM & GJ', amount: -10 })?.id).toBe('either');
		expect(findCoveringRule([either], { counterparty: 'BEADLE EM & GJ LTD', amount: -10 })).toBeUndefined();
	});

	it('prefers the rule for the line direction to one for either, and finds the rule a new one replaces', () => {
		expect(findCoveringRule([either, moneyIn], { counterparty: 'beadle em & gj', amount: 500 })?.id).toBe('in');
		expect(findCoveringRule([either, moneyIn], { counterparty: 'beadle em & gj', amount: -500 })?.id).toBe('either');
		expect(findSameRule([either, moneyIn], { counterparty: 'beadle em & gj', direction: 'in' })?.id).toBe('in');
	});
});
