export type InventoryMoment = 'before' | 'after';

/** Every table's row count at one moment of a migration run, as the run migrations workflow kept it. */
export type DataInventory = {
	migrationRunId: string;
	moment: InventoryMoment;
	takenAt: string;
	commitSha: string;
	migrationFiles: string[];
	rowCounts: Record<string, number>;
};

export type DataInventoryRow = {
	migration_run_id: string;
	moment: InventoryMoment;
	taken_at: string;
	commit_sha: string;
	migration_files: string[];
	row_counts: Record<string, number>;
};

export const dataInventoryColumns = 'migration_run_id, moment, taken_at, commit_sha, migration_files, row_counts';

export function fromDataInventoryRow(row: DataInventoryRow): DataInventory {
	return {
		migrationRunId: row.migration_run_id,
		moment: row.moment,
		takenAt: row.taken_at,
		commitSha: row.commit_sha,
		migrationFiles: row.migration_files,
		rowCounts: row.row_counts
	};
}
