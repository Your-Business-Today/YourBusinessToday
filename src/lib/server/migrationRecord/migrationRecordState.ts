import { HowAppliedValues, type AppliedMigration } from './appliedMigrationRecord';

/** Where every migration file stands against the record: run, failed in the latest run, or waiting. */
export type MigrationRecordState = {
	runBeforeRecord: AppliedMigration[];
	runByDeploy: AppliedMigration[];
	failedInLatestRun: string | null;
	waiting: string[];
};

/**
 * Sets the files this build carries and the files the latest run set out to run against the record. A run
 * stops at the file that fails, so the first file of the latest run that is not on the record is the one that
 * failed; it waits with every other file not on the record.
 */
export function readMigrationRecordState(
	record: AppliedMigration[],
	filesOnMain: string[],
	latestRunFiles: string[]
): MigrationRecordState {
	const recordedNames = new Set(record.map((applied) => applied.fileName));
	const isNotRecorded = (fileName: string) => !recordedNames.has(fileName);
	return {
		runBeforeRecord: record.filter((applied) => applied.howApplied === HowAppliedValues.runBeforeRecord),
		runByDeploy: record.filter((applied) => applied.howApplied === HowAppliedValues.runByDeploy).sort(newestFirst),
		failedInLatestRun: latestRunFiles.find(isNotRecorded) ?? null,
		waiting: filesOnMain.filter(isNotRecorded)
	};
}

function newestFirst(earlier: AppliedMigration, later: AppliedMigration): number {
	return later.appliedAt.localeCompare(earlier.appliedAt) || later.fileName.localeCompare(earlier.fileName);
}
