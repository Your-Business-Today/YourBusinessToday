/** Where a project keeps the latest run of each check: one table for its default branch, one for staging. */
export const branchRunTables = {
	main: 'project_main_runs',
	staging: 'project_staging_runs'
} as const;

export type BranchRunTable = (typeof branchRunTables)[keyof typeof branchRunTables];
