export type HowApplied = 'run_by_deploy' | 'run_before_record';

/** One migration file on the record the run migrations workflow keeps of the files it has applied. */
export type AppliedMigration = {
	fileName: string;
	appliedAt: string;
	commitSha: string;
	howApplied: HowApplied;
};

export type AppliedMigrationRow = {
	file_name: string;
	applied_at: string;
	commit_sha: string;
	how_applied: HowApplied;
};

export const appliedMigrationColumns = 'file_name, applied_at, commit_sha, how_applied';

export const HowAppliedValues = {
	runByDeploy: 'run_by_deploy',
	runBeforeRecord: 'run_before_record'
} as const satisfies Record<string, HowApplied>;

export function fromAppliedMigrationRow(row: AppliedMigrationRow): AppliedMigration {
	return {
		fileName: row.file_name,
		appliedAt: row.applied_at,
		commitSha: row.commit_sha,
		howApplied: row.how_applied
	};
}
