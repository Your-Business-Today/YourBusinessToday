import { describe, expect, it } from 'vitest';
import { toolFailureSentence, transientFailureSentence } from './toolFailureSentence';

const missingTableCodes = ['42P01', 'PGRST205'];

describe('toolFailureSentence', () => {
	it.each(missingTableCodes)('says a missing table is not worth retrying (%s)', (code) => {
		const sentence = toolFailureSentence({ code });
		expect(sentence).toContain('retrying will not help');
	});

	it('keeps the transient sentence for a failure it cannot name', () => {
		const sentence = toolFailureSentence(new Error('network'));
		expect(sentence).toBe(transientFailureSentence);
	});
});
