import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { brandLibraryBucket } from './brandLibraryStorage';
import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import { postingFootings } from '$lib/brand/library/libraryItem';

const migration = readFileSync('migrations/0184_brand_library.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the brand library migration', () => {
	it('creates only a table of its own, named for the brand, behind a guard', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(['brand_library_items']);
		expect(statements).toContain("raise exception 'public.brand_library_items already exists in another shape");
	});

	it('lets only people with Brand read, add and record, and gives nobody a way to delete', () => {
		const policies = statements.split('create policy').slice(1);
		expect(policies.length).toBe(5);
		for (const policy of policies) expect(policy).toContain("public.can_use_organisation_module(");
		expect(statements).not.toMatch(/for (delete|all)/i);
		expect(statements).not.toMatch(/on delete cascade/i);
	});

	it('keeps photos and videos in a private bucket at the size the app checks', () => {
		const { largestByteCount, longestFilename, showsCharacters, permissionGiverCharacters } = LibraryLimits;
		expect(statements).toContain(`values ('${brandLibraryBucket}', '${brandLibraryBucket}', false, ${largestByteCount}, array['image/*', 'video/*'])`);
		expect(statements).toContain(`byte_count between 1 and ${largestByteCount}`);
		expect(statements).toContain(`char_length(filename) between 1 and ${longestFilename}`);
		expect(statements).toContain(`char_length(shows) between 1 and ${showsCharacters}`);
		expect(statements).toContain(`char_length(permission_given_by) between 1 and ${permissionGiverCharacters}`);
	});

	it('allows exactly the posting footings the app offers', () => {
		const allowed = postingFootings.map((footing) => `'${footing}'`).join(', ');
		expect(statements).toContain(`posting in (${allowed})`);
	});
});
