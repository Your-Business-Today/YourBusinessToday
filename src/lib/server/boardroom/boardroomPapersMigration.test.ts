import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { boardPaperFileKinds, boardPaperLimits } from '$lib/data/boardroomPaperRules';
import { boardroomPapersBucket } from './boardroomPaperStorage';

const migration = readFileSync('migrations/0160_boardroom_agenda_papers.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const createdTablePattern = /create table if not exists public\.(\w+)/g;

function createdTables(): string[] {
	return [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
}

describe('the board papers migration', () => {
	it('creates only a table of its own, named boardroom', () => {
		expect(createdTables()).toEqual(['boardroom_agenda_papers']);
	});

	it('lets only the board’s directors read, and gives nobody a way to write or delete by a policy', () => {
		const policies = statements.split('create policy').slice(1);
		expect(policies.length).toBe(2);
		for (const policy of policies) {
			expect(policy).toMatch(/for select using/);
			expect(policy).toContain('public.is_boardroom_director(');
		}
	});

	it('holds the same limits and kinds of file as the service checks', () => {
		const { longestTitle, longestNote, longestFilename, largestByteCount } = boardPaperLimits;
		expect(statements).toContain(`char_length(title) between 1 and ${longestTitle}`);
		expect(statements).toContain(`char_length(note) between 1 and ${longestNote}`);
		expect(statements).toContain(`char_length(filename) between 1 and ${longestFilename}`);
		expect(statements).toContain(`byte_count between 1 and ${largestByteCount}`);
		expect(statements).toContain(`values ('${boardroomPapersBucket}', '${boardroomPapersBucket}', false, ${largestByteCount}`);
		for (const mimeType of Object.keys(boardPaperFileKinds)) {
			expect(statements.split(`'${mimeType}'`).length - 1).toBe(2);
		}
	});

	it('deletes nothing by a cascade and drops nothing', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/drop (table|column)/i);
	});
});
