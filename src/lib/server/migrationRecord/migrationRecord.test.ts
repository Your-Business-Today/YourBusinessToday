import { describe, expect, it } from 'vitest';
import { readMigrationRecordState } from './migrationRecordState';
import { describeMigrationRecord, noRecordYet } from './describeMigrationRecord';
import type { AppliedMigration } from './appliedMigrationRecord';

const runBefore = (fileName: string): AppliedMigration => ({
	fileName,
	appliedAt: '2026-11-11T02:10:00Z',
	commitSha: 'aaa1111bbb2222',
	howApplied: 'run_before_record'
});

const runByDeploy = (fileName: string, appliedAt: string): AppliedMigration => ({
	fileName,
	appliedAt,
	commitSha: 'ccc3333ddd4444',
	howApplied: 'run_by_deploy'
});

const record = [
	runBefore('0001_domain_brain.sql'),
	runBefore('0196_books_cost_reversal.sql'),
	runByDeploy('0197_applied_migrations.sql', '2026-11-11T02:10:01Z'),
	runByDeploy('0201_first.sql', '2026-11-11T02:10:02Z')
];
const filesOnMain = ['0001_domain_brain.sql', '0196_books_cost_reversal.sql', '0197_applied_migrations.sql', '0201_first.sql', '0202_second.sql', '0203_third.sql'];

describe('where the migration files stand against the record', () => {
	it('names the file that failed in the latest run, and every file not on the record as waiting', () => {
		const state = readMigrationRecordState(record, filesOnMain, ['0197_applied_migrations.sql', '0201_first.sql', '0202_second.sql', '0203_third.sql']);
		expect(state.failedInLatestRun).toBe('0202_second.sql');
		expect(state.waiting).toEqual(['0202_second.sql', '0203_third.sql']);
	});

	it('lists the files the deploy applied newest first, apart from those run before the record began', () => {
		const state = readMigrationRecordState(record, filesOnMain, []);
		expect(state.runByDeploy.map((applied) => applied.fileName)).toEqual(['0201_first.sql', '0197_applied_migrations.sql']);
		expect(state.runBeforeRecord).toHaveLength(2);
		expect(state.failedInLatestRun).toBeNull();
	});
});

describe('describing the record of applied migrations', () => {
	it('says when no record is kept yet', () => {
		expect(describeMigrationRecord(null)).toBe(noRecordYet);
	});

	it('says what ran, what failed and what waits', () => {
		const answer = describeMigrationRecord(readMigrationRecordState(record, filesOnMain, ['0201_first.sql', '0202_second.sql']));
		expect(answer).toContain('2 files, 0001_domain_brain.sql to 0196_books_cost_reversal.sql, ran before the record began.');
		expect(answer).toContain('The deploy has applied 2, newest first:\n- 0201_first.sql');
		expect(answer).toContain('commit ccc3333');
		expect(answer).toContain('0202_second.sql failed in the latest run and was rolled back; the next run applies it again.');
		expect(answer).toContain('Waiting for the next run, in its order: 0202_second.sql, 0203_third.sql.');
	});

	it('says so when nothing failed and nothing waits', () => {
		const answer = describeMigrationRecord(readMigrationRecordState(record, filesOnMain.slice(0, 4), ['0201_first.sql']));
		expect(answer).toContain('No file failed in the latest run.');
		expect(answer).toContain('No file is waiting: every migration on main is on the record.');
	});
});

describe('the migration files this build carries', () => {
	it('holds the record’s own migration, by file name', async () => {
		const { migrationFilesOnMain } = await import('./migrationFilesOnMain');
		expect(migrationFilesOnMain).toContain('0197_applied_migrations.sql');
		expect(migrationFilesOnMain).toEqual([...migrationFilesOnMain].sort());
	});
});
