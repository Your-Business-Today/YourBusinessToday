import { describe, expect, it } from 'vitest';
import { validateRecordId } from './isUuid';

describe('validateRecordId', () => {
	it('accepts a uuid in either case', () => {
		expect(validateRecordId('clientId', '0b6f8a52-5d3e-4c1b-9a7e-2f4d6c8e0a13')).toBeNull();
		expect(validateRecordId('clientId', '0B6F8A52-5D3E-4C1B-9A7E-2F4D6C8E0A13')).toBeNull();
	});

	it('refuses anything a uuid column cannot hold, naming the field', () => {
		expect(validateRecordId('clientId', 'acme')).toContain('The clientId must be an id');
		expect(validateRecordId('projectId', '')).toContain('The projectId must be an id');
	});
});
