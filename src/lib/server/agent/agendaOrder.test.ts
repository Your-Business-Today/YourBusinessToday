import { describe, expect, it } from 'vitest';
import { orderAgenda } from './agendaOrder';
import type { AgendaItem } from './agendaItem';

const item = (key: string, fields: Partial<AgendaItem>): AgendaItem => ({
	key, kind: 'information', isBug: false, projectId: 'ybt', projectName: 'YBT', subjectKind: 'task',
	subjectId: key, subjectTitle: key, ask: '', askedById: null, since: '2026-11-01T09:00:00Z', goal: null,
	taskPriority: null, storyPoints: null, ...fields
});

const everyFocus = { projectId: null, isBugsOnly: false };
const active = ['ybt', 'pfp', 'carp', 'jbb'];
const items = [
	item('chase-nigel', { kind: 'chase', projectId: null }),
	item('test-export', { kind: 'testing' }),
	item('newer-answer', { since: '2026-11-04T09:00:00Z' }),
	item('older-answer', { since: '2026-10-01T09:00:00Z' }),
	item('bug-test', { kind: 'testing', isBug: true, projectId: 'pfp' })
];
const keysOf = (ordered: AgendaItem[]) => ordered.map(({ key }) => key);

describe('the order the agent raises things', () => {
	it('puts every bug first, then the quick answers, then each kind in turn, the longest waiting first', () => {
		const keys = keysOf(orderAgenda(items, everyFocus, new Set(), active));
		expect(keys).toEqual(['bug-test', 'older-answer', 'newer-answer', 'test-export', 'chase-nigel']);
	});

	it('gives the same order however the items arrive', () => {
		const forwards = orderAgenda(items, everyFocus, new Set(), active);
		const backwards = orderAgenda([...items].reverse(), everyFocus, new Set(), active);
		expect(backwards).toEqual(forwards);
	});

	it('leaves out what the person put off', () => {
		expect(keysOf(orderAgenda(items, everyFocus, new Set(['bug-test']), active))).not.toContain('bug-test');
	});

	it('keeps to one project, or to bugs alone, when asked', () => {
		expect(orderAgenda(items, { projectId: 'pfp', isBugsOnly: false }, new Set(), active)).toHaveLength(1);
		expect(orderAgenda(items, { projectId: null, isBugsOnly: true }, new Set(), active)).toHaveLength(1);
	});

	it('leaves out a promise made on a task that was put off', () => {
		const promise = item('todo:1', { kind: 'promise', subjectId: 'task-9' });
		const kept = orderAgenda([promise, item('todo:2', { kind: 'promise' })], everyFocus, new Set(['task:task-9']), active);
		expect(keysOf(kept)).toEqual(['todo:2']);
	});

	it('raises only current work, never what counts toward a long term goal', () => {
		const parked = item('parked', { goal: { id: 'g-later', title: 'Office chat', horizon: 'long_term' } });
		const live = item('live', { goal: { id: 'g-now', title: 'Launch', horizon: 'current' } });
		const loose = item('loose', { goal: null });
		expect(keysOf(orderAgenda([parked, live, loose], everyFocus, new Set(), active))).toEqual(['live', 'loose']);
	});

	it('works the first three active projects with anything to raise, and the fourth once one runs dry', () => {
		const onEach = ['ybt', 'pfp', 'carp', 'jbb'].map((projectId) => item(projectId, { projectId }));
		expect(keysOf(orderAgenda(onEach, everyFocus, new Set(), active))).not.toContain('jbb');
		expect(keysOf(orderAgenda(onEach.slice(1), everyFocus, new Set(), active))).toContain('jbb');
	});

	it('leaves out projects that are not active', () => {
		expect(orderAgenda([item('paused', { projectId: 'old' })], everyFocus, new Set(), active)).toHaveLength(0);
	});

	it('weighs the rest by priority and size blended, the lowest score first', () => {
		const bigTop = item('big-top', { kind: 'build', taskPriority: 1, storyPoints: 8 });
		const smallLower = item('small-lower', { kind: 'build', taskPriority: 3, storyPoints: 1 });
		const unsized = item('unsized', { kind: 'build' });
		const keys = keysOf(orderAgenda([unsized, bigTop, smallLower], everyFocus, new Set(), active));
		expect(keys).toEqual(['small-lower', 'big-top', 'unsized']);
	});

	it('offers a long term goal to make current after everything else', () => {
		const goal = item('goal:g1', { kind: 'goal', isBug: true, goal: { id: 'g1', title: 'KB', horizon: 'long_term' } });
		const keys = keysOf(orderAgenda([goal, item('chase', { kind: 'chase' })], everyFocus, new Set(), active));
		expect(keys).toEqual(['chase', 'goal:g1']);
	});
});
