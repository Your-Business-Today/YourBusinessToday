import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { brandLibraryBucket } from './brandLibraryStorage';
import { libraryAllowedTypes } from '$lib/brand/library/libraryLimits';

const migration = readFileSync('migrations/0231_brand_library_music.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the brand library music migration', () => {
	it('widens the type check to music under its own name, dropping no table, column or row', () => {
		expect(statements).toContain("check (mime_type ~ '^(image|video|audio)/[^/[:space:]]{1,127}$')");
		expect(statements).toContain('drop constraint if exists brand_library_items_mime_type_check');
		expect(statements).not.toMatch(/drop (table|column)|delete from|truncate/i);
	});

	it('lets the bucket take exactly the types the app states', () => {
		const allowed = libraryAllowedTypes.map((type) => `'${type}'`).join(', ');
		expect(statements).toContain(`set allowed_mime_types = array[${allowed}]`);
		expect(statements).toContain(`where id = '${brandLibraryBucket}'`);
	});
});
