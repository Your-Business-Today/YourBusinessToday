import { describe, expect, it, vi } from 'vitest';
import { chooseTodoOwner, todoOwnerNeedsAProject, todoOwnerOffProject } from './chooseTodoOwner';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Todo } from './todoRecord';

vi.mock('$lib/server/members/getPeopleOnProject', () => ({
	getPeopleOnProject: async () => [{ id: 'dana', name: 'Dana Wright', email: 'dana@example.com' }]
}));

const supabase = {} as SupabaseClient;
const underATask = { id: 'quote', projectId: 'project', taskId: 'insurance' } as Todo;

describe('whose a to-do becomes', () => {
	it('goes to someone on its project, named by email or id', async () => {
		expect(await chooseTodoOwner(supabase, underATask, 'dana@example.com')).toEqual({ ownerAccountId: 'dana' });
	});

	it('goes to nobody for anyone on the project to take', async () => {
		expect(await chooseTodoOwner(supabase, underATask, 'nobody')).toEqual({ ownerAccountId: null });
	});

	it('refuses someone off the project, and a to-do on its owner’s own list', async () => {
		expect(await chooseTodoOwner(supabase, underATask, 'stranger@example.com')).toBe(todoOwnerOffProject);
		expect(await chooseTodoOwner(supabase, { ...underATask, projectId: null }, 'dana')).toBe(todoOwnerNeedsAProject);
	});
});
