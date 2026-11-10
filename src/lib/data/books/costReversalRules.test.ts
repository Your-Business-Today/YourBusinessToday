import { describe, expect, it } from 'vitest';
import { costJournalIds, reversedCostRefusal } from './costReversalRules';

const recordingId = '00000000-0000-4000-8000-0000000j0001';
const paymentId = '00000000-0000-4000-8000-0000000j0002';
const adobe = { supplier: 'Adobe', recordedJournalId: recordingId, paymentJournalId: paymentId };

function reversalOf(reversedJournalId: string, description: string) {
	return { journalId: '00000000-0000-4000-8000-0000000j0009', journalDate: '2026-11-12', description, reversedJournalId };
}

describe('a cost whose posting another journal reverses', () => {
	it('posted the journals that recorded and paid it, and only the recording until it is paid', () => {
		expect(costJournalIds(adobe)).toEqual([recordingId, paymentId]);
		expect(costJournalIds({ ...adobe, paymentJournalId: null })).toEqual([recordingId]);
		expect(costJournalIds({ ...adobe, recordedJournalId: null, paymentJournalId: null })).toEqual([]);
	});

	it('may go when nothing reverses it', () => {
		expect(reversedCostRefusal(adobe, [])).toBeNull();
	});

	it('stays, naming the reversal of its recording by day and description', () => {
		const refusal = reversedCostRefusal(adobe, [reversalOf(recordingId, 'Adobe recorded twice')]);
		expect(refusal).toBe(
			'The cost from Adobe was reversed in the ledger: its recording by the journal of 12 Nov 2026, "Adobe recorded twice". ' +
				'It stays in the books as recorded and reversed.'
		);
	});

	it('stays, naming the reversal of its payment and of its recording alike', () => {
		const reversals = [reversalOf(recordingId, 'Undo the cost'), reversalOf(paymentId, 'Undo the payment')];
		const refusal = reversedCostRefusal(adobe, reversals);
		expect(refusal).toContain('its recording by the journal of 12 Nov 2026, "Undo the cost"; its payment by the journal of 12 Nov 2026, "Undo the payment".');
	});
});
