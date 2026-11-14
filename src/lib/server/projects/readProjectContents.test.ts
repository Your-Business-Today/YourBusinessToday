import { describe, expect, it } from 'vitest';
import { readProjectContents } from './readProjectContents';
import type { SupabaseClient } from '@supabase/supabase-js';

type CountAnswer = { count: number | null; error: unknown };
type AnswerTo = (question: string) => CountAnswer;

const projectId = 'project-1';
const countsHeld: Record<string, number> = {
	'goals where project_id is project-1': 2,
	'tasks where project_id is project-1 and status is not done': 5,
	'tasks where project_id is project-1 and status is done': 187,
	'task_attachments where tasks.project_id is project-1': 3
};
const refusedByTheDatabase = { message: 'permission denied' };

function countReadOn(table: string, answerTo: AnswerTo) {
	const narrowings: string[] = [];
	const narrowedBy = (narrowing: string) => {
		narrowings.push(narrowing);
		return read;
	};
	const read = {
		select: () => read,
		eq: (column: string, value: string) => narrowedBy(`${column} is ${value}`),
		neq: (column: string, value: string) => narrowedBy(`${column} is not ${value}`),
		then: (resolve: (answer: CountAnswer) => unknown) => resolve(answerTo(`${table} where ${narrowings.join(' and ')}`))
	};
	return read;
}

function databaseAnswering(answerTo: AnswerTo): SupabaseClient {
	return { from: (table: string) => countReadOn(table, answerTo) } as unknown as SupabaseClient;
}

describe('readProjectContents', () => {
	it('counts the goals, the open tasks, the finished tasks and the attached files, each as its own figure', async () => {
		const database = databaseAnswering((question) => ({ count: countsHeld[question] ?? -1, error: null }));
		const contents = await readProjectContents(database, projectId);
		expect(contents).toEqual({ goalCount: 2, openTaskCount: 5, finishedTaskCount: 187, attachedFileCount: 3 });
	});

	it('reads a count the database leaves out as none', async () => {
		const database = databaseAnswering(() => ({ count: null, error: null }));
		const contents = await readProjectContents(database, projectId);
		expect(contents).toEqual({ goalCount: 0, openTaskCount: 0, finishedTaskCount: 0, attachedFileCount: 0 });
	});

	it('passes on what the database refuses, so nothing is decided on a count that was never read', async () => {
		const database = databaseAnswering(() => ({ count: null, error: refusedByTheDatabase }));
		await expect(readProjectContents(database, projectId)).rejects.toBe(refusedByTheDatabase);
	});
});
