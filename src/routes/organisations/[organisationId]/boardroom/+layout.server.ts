import { requireBoardroomDirector } from '$lib/server/auth/requireBoardroomDirector';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { organisation } = await requireBoardroomDirector(locals, params.organisationId);
	return { organisation: { id: organisation.id, name: organisation.name } };
};
