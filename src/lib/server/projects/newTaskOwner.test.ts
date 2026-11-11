import { describe, expect, it } from 'vitest';
import { ownerNotOnProjectRefusal, readNewTaskOwner } from './newTaskOwner';
import type { SupabaseClient } from '@supabase/supabase-js';

const peopleOnProject = [{ id: 'jeremy', name: 'Jeremy', email: '', is_owner: false, via_organisation: '' }];
const supabase = { rpc: async () => ({ data: peopleOnProject, error: null }) } as unknown as SupabaseClient;

function formChoosing(ownerId: string): FormData {
	const formData = new FormData();
	formData.set('ownerId', ownerId);
	return formData;
}

describe('the owner a new item is given to', () => {
	it('is nobody when none is chosen', async () => {
		expect(await readNewTaskOwner(supabase, 'project', formChoosing(''))).toEqual({ ownerIds: [], refusal: null });
	});

	it('is the person chosen when they are on the project', async () => {
		expect(await readNewTaskOwner(supabase, 'project', formChoosing('jeremy'))).toEqual({
			ownerIds: ['jeremy'],
			refusal: null
		});
	});

	it('is refused, by name, when they are not on the project', async () => {
		expect(await readNewTaskOwner(supabase, 'project', formChoosing('stranger'))).toEqual({
			ownerIds: null,
			refusal: ownerNotOnProjectRefusal
		});
	});
});
