import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { businessBrainFileLimits } from '$lib/data/businessBrainFileRules';
import { businessBrainFilesBucket } from './businessBrainFileStorage';

const migration = readFileSync('migrations/0157_business_brain_files.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const createdTablePattern = /create table if not exists public\.(\w+)/g;

function createdTables(): string[] {
	return [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
}

describe('the Your Business Brain files migration', () => {
	it('creates only tables of its own, named business_brain', () => {
		expect(createdTables()).toEqual(['business_brain_files', 'business_brain_page_files']);
	});

	it('lets people read only behind the one module rule, and gives nobody a way to write or delete', () => {
		const policies = statements.split('create policy').slice(1);
		expect(policies.length).toBe(3);
		for (const policy of policies) {
			expect(policy).toMatch(/for select using/);
			expect(policy).toContain("public.can_use_organisation_module(");
		}
	});

	it('keeps the files in a private bucket at the size the app checks', () => {
		expect(statements).toContain(`values ('${businessBrainFilesBucket}', '${businessBrainFilesBucket}', false, ${businessBrainFileLimits.largestByteCount})`);
		expect(statements).toContain(`byte_count between 1 and ${businessBrainFileLimits.largestByteCount}`);
		expect(statements).toContain(`char_length(filename) between 1 and ${businessBrainFileLimits.longestFilename}`);
	});

	it('deletes nothing by a cascade', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
	});
});
