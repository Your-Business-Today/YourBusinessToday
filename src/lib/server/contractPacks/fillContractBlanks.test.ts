import { describe, expect, it } from 'vitest';
import { fillContractBlanks } from './fillContractBlanks';

describe('filling a contract document for a client', () => {
	it('fills each blank that has a value, every time it appears', () => {
		const filled = fillContractBlanks('[Client legal name] signs. For [Client legal name].', { 'Client legal name': 'Harbour Ltd' });
		expect(filled).toBe('Harbour Ltd signs. For Harbour Ltd.');
	});

	it('leaves a blank nobody knows in its brackets, to be seen', () => {
		const filled = fillContractBlanks('Start: [Start date]. Fee: £[Day rate].', { 'Start date': '  ' });
		expect(filled).toBe('Start: [Start date]. Fee: £[Day rate].');
	});

	it('leaves links and ticks alone', () => {
		const markdown = '- [ ] Discovery, see [the policy](https://example.com).';
		expect(fillContractBlanks(markdown, { ' ': 'x', 'the policy': 'nothing' })).toBe(markdown);
	});
});
