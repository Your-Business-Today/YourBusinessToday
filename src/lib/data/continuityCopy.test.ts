import { describe, expect, it } from 'vitest';
import { continuityCopyLimits, validateContinuityCopy } from './continuityCopy';

const today = '2026-11-01';

describe('validateContinuityCopy', () => {
	it('keeps a connection and an opened copy with who confirmed it', () => {
		const fields = { storageConnectedOn: '2026-10-31', copyOpenedOn: '2026-11-01', copyConfirmedBy: ' Nigel Reilly ' };
		expect(validateContinuityCopy(fields, today)).toEqual({
			storageConnectedOn: '2026-10-31',
			copyOpenedOn: '2026-11-01',
			copyConfirmedBy: 'Nigel Reilly'
		});
	});

	it('keeps a connection alone, with nobody named', () => {
		const fields = { storageConnectedOn: '2026-10-31', copyOpenedOn: '', copyConfirmedBy: 'ignored' };
		expect(validateContinuityCopy(fields, today)).toEqual({
			storageConnectedOn: '2026-10-31',
			copyOpenedOn: null,
			copyConfirmedBy: null
		});
	});

	it.each([
		[{ storageConnectedOn: '31/10/2026' }, 'YYYY-MM-DD'],
		[{ storageConnectedOn: '2026-02-30' }, 'YYYY-MM-DD'],
		[{ storageConnectedOn: '2026-11-02' }, 'after today'],
		[{ storageConnectedOn: '2026-10-31', copyOpenedOn: '2026-11-01' }, 'Who confirmed'],
		[{ copyOpenedOn: '2026-11-01', copyConfirmedBy: 'Nigel' }, 'before the storage'],
		[{ storageConnectedOn: '2026-11-01', copyOpenedOn: '2026-10-31', copyConfirmedBy: 'Nigel' }, 'before the storage'],
		[{ copyConfirmedBy: 'x'.repeat(continuityCopyLimits.longestConfirmedBy + 1) }, 'Who confirmed']
	])('refuses %j, naming why', (fields, reason) => {
		expect(validateContinuityCopy(fields, today)).toContain(reason);
	});
});
