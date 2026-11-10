import { formatUkDateTime } from '$lib/data/britishDate';
import type { AppliedMigration } from './appliedMigrationRecord';
import type { MigrationRecordState } from './migrationRecordState';

export const noRecordYet =
	'No record of applied migrations is kept yet: the first deploy after it merged begins it, recording every file ' +
	'already on main as run before the record began.';

const shortCommitLength = 7;

/** Which migration files have run, which failed in the latest run and which wait for the next one. */
export function describeMigrationRecord(state: MigrationRecordState | null): string {
	if (state === null) return noRecordYet;
	return [
		describeRunBeforeRecord(state.runBeforeRecord),
		describeRunByDeploy(state.runByDeploy),
		describeFailure(state.failedInLatestRun),
		describeWaiting(state.waiting)
	].join('\n');
}

function describeRunBeforeRecord(runBeforeRecord: AppliedMigration[]): string {
	const [first] = runBeforeRecord;
	const last = runBeforeRecord.at(-1);
	if (first === undefined || last === undefined) return 'No file is recorded as run before the record began.';
	return `${runBeforeRecord.length} files, ${first.fileName} to ${last.fileName}, ran before the record began.`;
}

function describeRunByDeploy(runByDeploy: AppliedMigration[]): string {
	if (runByDeploy.length === 0) return 'The deploy has applied no file since the record began.';
	return [`The deploy has applied ${runByDeploy.length}, newest first:`, ...runByDeploy.map(describeApplied)].join('\n');
}

function describeApplied(applied: AppliedMigration): string {
	const commit = applied.commitSha.slice(0, shortCommitLength);
	return `- ${applied.fileName}, ${formatUkDateTime(applied.appliedAt)} UK time, commit ${commit}`;
}

function describeFailure(failedInLatestRun: string | null): string {
	if (failedInLatestRun === null) return 'No file failed in the latest run.';
	return `${failedInLatestRun} failed in the latest run and was rolled back; the next run applies it again.`;
}

function describeWaiting(waiting: string[]): string {
	if (waiting.length === 0) return 'No file is waiting: every migration on main is on the record.';
	return `Waiting for the next run, in its order: ${waiting.join(', ')}.`;
}
