import { readKeptVideos } from '$lib/server/projectVideos/findProjectVideos';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { signVideoLinks } from '$lib/server/projectVideos/signVideoLinks';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const keptVideos = await readKeptVideos(locals.supabase, project.id);
	return { project, videos: await signVideoLinks(locals.supabase, keptVideos) };
};
