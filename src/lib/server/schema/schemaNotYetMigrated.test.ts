import { describe, expect, it } from 'vitest';
import { isSchemaNotYetMigrated } from './schemaNotYetMigrated';

const notYetMigratedCodes = ['42P01', '42703', 'PGRST200', 'PGRST204', 'PGRST205'];

describe('isSchemaNotYetMigrated', () => {
	it.each(notYetMigratedCodes)('recognises a missing table, column or relationship (%s)', (code) => {
		expect(isSchemaNotYetMigrated({ code })).toBe(true);
	});

	it('leaves every other failure to be thrown', () => {
		expect(isSchemaNotYetMigrated({ code: '23505' })).toBe(false);
		expect(isSchemaNotYetMigrated(new Error('network'))).toBe(false);
		expect(isSchemaNotYetMigrated(null)).toBe(false);
	});
});
