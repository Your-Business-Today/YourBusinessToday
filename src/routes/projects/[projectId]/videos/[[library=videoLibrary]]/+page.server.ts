import { error } from '@sveltejs/kit';
import { readKeptVideos } from '$lib/server/projectVideos/findProjectVideos';
import { readLibrarySearch } from '$lib/server/projectLibrary/readLibrarySearch';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { signVideoLinks } from '$lib/server/projectVideos/signVideoLinks';
import { videoActions } from './videoActions';
import { videoLibraryAt } from '$lib/components/projects/videos/videoLibraryAddress';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const library = videoLibraryAt(params.library);
	if (library === null) error(404, 'No such video library');
	const keptVideos = await readKeptVideos(locals.supabase, project.id, library);
	const search = await readLibrarySearch(locals.supabase, project.id, url);
	return { project, library, search, videos: await signVideoLinks(locals.supabase, keptVideos) };
};

export const actions = { ...videoActions } satisfies Actions;
