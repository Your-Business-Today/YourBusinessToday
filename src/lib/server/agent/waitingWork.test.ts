import { describe, expect, it, vi } from 'vitest';
import { withoutWaitingWork } from './waitingWork';
import type { AgendaBoard, BoardTask } from './agendaBoard';
import type { AgendaItem } from './agendaItem';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('./tasksWaitingOnOthers', () => ({
	getTasksWaitingOnOthers: async () => new Set(['with-katie'])
}));

const item = (key: string, fields: Partial<AgendaItem>): AgendaItem => ({
	key, kind: 'task', isBug: false, projectId: 'ybt', projectName: 'YBT', subjectKind: 'task', subjectId: key,
	subjectTitle: key, ask: '', askedById: null, since: null, goal: null, taskPriority: null, storyPoints: null, ...fields
});
const task = (id: string, fields: Partial<BoardTask>): BoardTask => ({
	id, projectId: 'ybt', title: id, goalId: null, parentTaskId: null, waitsForTaskId: null, status: 'backlog',
	department: 'administration', priority: 1, storyPoints: 2, isBuildable: false, createdAt: '2026-11-01', ...fields
});
const board: AgendaBoard = {
	projectNamesById: new Map(),
	goalsById: new Map(),
	tasksById: new Map([
		['blocker', task('blocker', {})],
		['follows', task('follows', { waitsForTaskId: 'blocker' })]
	])
};
const supabase = {} as SupabaseClient;

describe('work that waits on someone else', () => {
	it('leaves out a task whose question is open for someone else, or that follows an unfinished task', async () => {
		const items = [item('with-katie', {}), item('follows', {}), item('mine', {}), item('ask', { kind: 'information' })];
		const kept = await withoutWaitingWork(supabase, items, board, ['james']);
		expect(kept.map(({ key }) => key)).toEqual(['mine', 'ask']);
	});
});
