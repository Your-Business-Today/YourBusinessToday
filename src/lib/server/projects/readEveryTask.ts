import { readEveryRow } from '$lib/server/schema/readEveryRow';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';

type TaskPage = Parameters<typeof readEveryRow>[0];

/**
 * Every task a query matches, a page at a time, so a project past the database's row cap
 * keeps its newest tasks. The query is built afresh for each page and must be ordered on a
 * unique last column, so no task falls between two pages or lands on both.
 */
export async function readEveryTask(readPage: TaskPage): Promise<ProjectTask[]> {
	const rows = await readEveryRow(readPage);
	return rows.map(parseTaskRecord);
}
