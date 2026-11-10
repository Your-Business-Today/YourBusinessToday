import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { boardRecordSources } from '$lib/data/boardroomRecordPaper';
import { boardRecordPaperLimits } from '$lib/data/boardroomRecordPaperRules';
import { recordPapersTable } from './getBoardroomRecordPapers';

const migration = readFileSync('migrations/0162_boardroom_record_papers.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const createdTablePattern = /create table if not exists public\.(\w+)/g;

function createdTables(): string[] {
	return [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
}

describe('the record papers migration', () => {
	it('creates only a table of its own, named boardroom, under the name the service reads', () => {
		expect(createdTables()).toEqual([recordPapersTable]);
	});

	it('holds the same sources and limits as the service checks', () => {
		const { longestTitle, longestReading } = boardRecordPaperLimits;
		expect(statements).toContain(`char_length(title) between 1 and ${longestTitle}`);
		expect(statements).toContain(`char_length(reading) between 1 and ${longestReading}`);
		for (const source of boardRecordSources) expect(statements).toContain(`'${source}'`);
	});

	it('lets only the board’s directors read, through the module rule of the paper’s source, and nobody write by a policy', () => {
		const policies = statements.split('create policy').slice(1);
		expect(policies).toHaveLength(1);
		expect(policies[0]).toMatch(/for select using/);
		expect(policies[0]).toContain('public.is_boardroom_director(organisation_id)');
		expect(policies[0]).toContain("public.can_use_organisation_module(organisation_id, 'books')");
		expect(policies[0]).toContain("public.can_use_organisation_module(organisation_id, 'business_brain')");
	});

	it('keeps every paper as it was taken: the trigger refuses a change or a delete', () => {
		expect(statements).toContain('before insert or update or delete on public.boardroom_record_papers');
		expect(statements).toContain("if tg_op <> 'INSERT' then");
	});

	it('deletes nothing by a cascade and drops nothing', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/drop (table|column)/i);
	});
});
