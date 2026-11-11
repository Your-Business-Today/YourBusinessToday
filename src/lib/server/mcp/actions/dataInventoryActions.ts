import { findLatestDataInventories } from '$lib/server/dataInventory/findLatestDataInventories';
import { findAppliedMigrations } from '$lib/server/migrationRecord/findAppliedMigrations';
import { migrationFilesOnMain } from '$lib/server/migrationRecord/migrationFilesOnMain';
import { readMigrationRecordState } from '$lib/server/migrationRecord/migrationRecordState';
import { describeMigrationRecord } from '$lib/server/migrationRecord/describeMigrationRecord';
import { describeDataInventories } from './describeDataInventory';
import { objectSchema } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const dataInventoryActions: McpAction[] = [
	{
		name: 'read_data_inventory',
		area: 'support',
		audience: 'admin',
		isWrite: false,
		summary:
			'every table’s row count in the latest data inventory and the one before it, as the migration run took them, ' +
			'with any table that has fewer rows named first, and which migration files have run, which failed in the ' +
			'latest run and which are waiting',
		guidance:
			'Read it to show that no deploy lost a row, what an old table holds before its data is copied, or whether ' +
			'every migration on main has run. The run migrations workflow runs every migration file on main that is not ' +
			'on its record of applied migrations, records each as it is applied, and stops at the first that fails, ' +
			'which the next run applies again. It takes a reading before the first file and after the last, and goes ' +
			'red when a table has fewer rows after. It counts rows and never reads what a row holds.',
		inputSchema: objectSchema({}),
		run: readDataInventory
	}
];

async function readDataInventory(caller: McpCaller): Promise<string> {
	const [inventories, record] = await Promise.all([
		findLatestDataInventories(caller.supabase),
		findAppliedMigrations(caller.supabase)
	]);
	const [latestReading] = inventories;
	const latestRunFiles = latestReading?.migrationFiles ?? [];
	const state = record === null ? null : readMigrationRecordState(record, migrationFilesOnMain, latestRunFiles);
	return [describeDataInventories(inventories), describeMigrationRecord(state)].join('\n\n');
}
