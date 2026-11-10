import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getTasksForProject } from './getTasksForProject';
import { rowsPerRequest } from '$lib/server/schema/readEveryRow';

const projectId = 'project-past-the-cap';
const taskCount = rowsPerRequest * 2 + 350;

type RowRange = { firstRow: number; lastRow: number };

function storedTask(priority: number): Record<string, unknown> {
	return { id: `task-${priority}`, project_id: projectId, title: `Task ${priority}`, priority, status: 'backlog' };
}

function projectHoldingTasks(rows: Record<string, unknown>[], rangesRead: RowRange[]): SupabaseClient {
	const query = {
		select: () => query,
		eq: () => query,
		order: () => query,
		range: (firstRow: number, lastRow: number) => {
			rangesRead.push({ firstRow, lastRow });
			return Promise.resolve({ data: rows.slice(firstRow, lastRow + 1), error: null });
		}
	};
	return { from: () => query } as unknown as SupabaseClient;
}

describe('getTasksForProject', () => {
	it('reads every task of a project past the row cap, in priority order', async () => {
		const storedTasks = Array.from({ length: taskCount }, (_, index) => storedTask(index + 1));
		const rangesRead: RowRange[] = [];
		const tasks = await getTasksForProject(projectHoldingTasks(storedTasks, rangesRead), projectId);
		const priorities = tasks.map((task) => task.priority);
		expect(tasks).toHaveLength(taskCount);
		expect(priorities).toEqual(storedTasks.map((row) => row.priority));
		expect(rangesRead).toHaveLength(3);
	});

	it('asks for one more page when the last page comes back exactly full', async () => {
		const storedTasks = Array.from({ length: rowsPerRequest }, (_, index) => storedTask(index + 1));
		const rangesRead: RowRange[] = [];
		const tasks = await getTasksForProject(projectHoldingTasks(storedTasks, rangesRead), projectId);
		expect(tasks).toHaveLength(rowsPerRequest);
		expect(rangesRead).toEqual([
			{ firstRow: 0, lastRow: rowsPerRequest - 1 },
			{ firstRow: rowsPerRequest, lastRow: rowsPerRequest * 2 - 1 }
		]);
	});
});
