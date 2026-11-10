import { formatUkDateTime } from '$lib/data/britishDate';
import { compareRowCounts, hasLostRows, type TableRowCountChange } from '$lib/server/dataInventory/tableRowCountChange';
import type { DataInventory } from '$lib/server/dataInventory/dataInventoryRecord';

export const noInventoryYet =
	'No data inventory is kept yet: the first is taken by the next migration run, when a merge into main adds a migration.';

const shortCommitLength = 7;
const notThere = 'not there';

/** The latest reading and the one before it, every table's count in each, with the tables that lost rows first. */
export function describeDataInventories(inventories: DataInventory[]): string {
	const [latest, previous] = inventories;
	if (latest === undefined) return noInventoryYet;
	if (previous === undefined) return [describeReading('The only reading', latest), ...describeCounts(latest)].join('\n');
	const changes = compareRowCounts(previous.rowCounts, latest.rowCounts);
	return [
		describeReading('The latest reading', latest),
		describeReading('The one before it', previous),
		describeLostRows(changes.filter(hasLostRows)),
		'Every table, the reading before → the latest:',
		...changes.map(describeChange)
	].join('\n');
}

function describeReading(label: string, inventory: DataInventory): string {
	const commit = inventory.commitSha.slice(0, shortCommitLength);
	const files = inventory.migrationFiles.join(', ');
	return `${label}: ${inventory.moment} the migrations of commit ${commit} (${files}), taken ${formatUkDateTime(inventory.takenAt)} UK time.`;
}

function describeCounts(inventory: DataInventory): string[] {
	const tableNames = Object.keys(inventory.rowCounts).sort();
	return tableNames.map((tableName) => `- ${tableName}: ${inventory.rowCounts[tableName]}`);
}

function describeLostRows(lostChanges: TableRowCountChange[]): string {
	if (lostChanges.length === 0) return 'No table has fewer rows than in the reading before.';
	return `These tables have fewer rows than in the reading before: ${lostChanges.map(describeLoss).join('; ')}.`;
}

function describeLoss(change: TableRowCountChange): string {
	return `${change.tableName} (${countOrNotThere(change.earlierCount)} → ${countOrNotThere(change.laterCount)})`;
}

function describeChange(change: TableRowCountChange): string {
	return `- ${change.tableName}: ${countOrNotThere(change.earlierCount)} → ${countOrNotThere(change.laterCount)}`;
}

function countOrNotThere(count: number | null): string {
	return count === null ? notThere : String(count);
}
