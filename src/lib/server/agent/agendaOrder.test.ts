import { describe, expect, it } from 'vitest';
import { orderAgenda } from './agendaOrder';
import type { AgendaItem } from './agendaItem';

const item = (key: string, fields: Partial<AgendaItem>): AgendaItem => ({
	key, kind: 'information', isBug: false, projectId: 'ybt', projectName: 'YBT', subjectKind: 'task',
	subjectId: key, subjectTitle: key, ask: '', askedById: null, since: '2026-11-01T09:00:00Z', ...fields
});

const everyFocus = { projectId: null, isBugsOnly: false };
const items = [
	item('chase-nigel', { kind: 'chase', projectId: null }),
	item('test-export', { kind: 'testing' }),
	item('newer-answer', { since: '2026-11-04T09:00:00Z' }),
	item('older-answer', { since: '2026-10-01T09:00:00Z' }),
	item('bug-test', { kind: 'testing', isBug: true, projectId: 'pfp' })
];

describe('the order the agent raises things', () => {
	it('puts every bug first, then each kind in turn, the longest waiting first', () => {
		const keys = orderAgenda(items, everyFocus, new Set()).map(({ key }) => key);
		expect(keys).toEqual(['bug-test', 'older-answer', 'newer-answer', 'test-export', 'chase-nigel']);
	});

	it('gives the same order however the items arrive', () => {
		const forwards = orderAgenda(items, everyFocus, new Set());
		const backwards = orderAgenda([...items].reverse(), everyFocus, new Set());
		expect(backwards).toEqual(forwards);
	});

	it('leaves out what the person put off', () => {
		const keys = orderAgenda(items, everyFocus, new Set(['bug-test'])).map(({ key }) => key);
		expect(keys).not.toContain('bug-test');
	});

	it('keeps to one project, or to bugs alone, when asked', () => {
		expect(orderAgenda(items, { projectId: 'pfp', isBugsOnly: false }, new Set())).toHaveLength(1);
		expect(orderAgenda(items, { projectId: null, isBugsOnly: true }, new Set())).toHaveLength(1);
	});
});
