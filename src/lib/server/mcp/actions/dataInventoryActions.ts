import { findLatestDataInventories } from '$lib/server/dataInventory/findLatestDataInventories';
import { describeDataInventories } from './describeDataInventory';
import { objectSchema } from '../actionTypes';
import type { McpAction } from '../actionTypes';

export const dataInventoryActions: McpAction[] = [
	{
		name: 'read_data_inventory',
		area: 'support',
		audience: 'admin',
		isWrite: false,
		summary:
			'every table’s row count in the latest data inventory and the one before it, as the migration run took them, ' +
			'with any table that has fewer rows named first',
		guidance:
			'Read it to show that no deploy lost a row, or what an old table holds before its data is copied. The run ' +
			'migrations workflow takes a reading before the first migration a merge into main adds and after the last, ' +
			'and goes red when a table has fewer rows after. It counts rows and never reads what a row holds.',
		inputSchema: objectSchema({}),
		run: async (caller) => describeDataInventories(await findLatestDataInventories(caller.supabase))
	}
];
