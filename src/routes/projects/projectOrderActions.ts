import { fail } from '@sveltejs/kit';
import { moveProject, type ProjectMoveDirection } from '$lib/server/projects/moveProject';
import {
	parseDropPlacement,
	parsePriorityNumber,
	priorityNumberRefusal
} from '$lib/server/ordering/rankInput';
import { placeProject } from '$lib/server/projects/placeProject';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { setProjectPriority } from '$lib/server/projects/setProjectPriority';
import type { Actions } from './$types';

const projectRequired = 'A project is required.';
const oneBoardOnly = 'Both projects must be on one board: the ones you own, or the ones you are on.';

/** Each person orders two boards: the projects they own, and the projects they are on. */
export const projectOrderActions = {
	moveProject: async ({ locals, request }) => {
		const formData = await request.formData();
		const projectId = String(formData.get('projectId') ?? '');
		const direction = String(formData.get('direction')) as ProjectMoveDirection;
		if (projectId === '') return fail(400, { message: projectRequired });
		const { user } = await requireProjectAccess(locals, projectId);
		await moveProject(locals.supabase, projectId, direction, user.id);
		return {};
	},
	placeProject: async ({ locals, request }) => {
		const formData = await request.formData();
		const movedProjectId = String(formData.get('movedProjectId') ?? '');
		const targetProjectId = String(formData.get('targetProjectId') ?? '');
		if (movedProjectId === '' || targetProjectId === '') {
			return fail(400, { message: 'A project to move and a drop target are required.' });
		}
		const moved = await requireProjectAccess(locals, movedProjectId);
		const target = await requireProjectAccess(locals, targetProjectId);
		if (moved.isOwner !== target.isOwner) return fail(400, { message: oneBoardOnly });
		const placement = parseDropPlacement(formData.get('placement'));
		const mover = moved.user;
		await placeProject(locals.supabase, movedProjectId, targetProjectId, placement, mover.id);
		return {};
	},
	setProjectPriority: async ({ locals, request }) => {
		const formData = await request.formData();
		const projectId = String(formData.get('projectId') ?? '');
		if (projectId === '') return fail(400, { message: projectRequired });
		const { user } = await requireProjectAccess(locals, projectId);
		const priority = parsePriorityNumber(formData.get('priority'));
		if (priority === null) return fail(400, { message: priorityNumberRefusal });
		await setProjectPriority(locals.supabase, projectId, priority, user.id);
		return {};
	}
} satisfies Actions;
