import { error } from '@sveltejs/kit';
import { readBusinessBrainPageWhole } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import { readBusinessBrainPageHistory } from '$lib/server/businessBrain/readBusinessBrainPageHistory';
import { readBusinessBrainPageLinks } from '$lib/server/businessBrain/readBusinessBrainPageLinks';
import { readFilesNamedByPage } from '$lib/server/businessBrain/readKeptBusinessBrainFiles';
import { readBusinessBrainParentPage } from '$lib/server/businessBrain/readBusinessBrainParentPage';
import { readRevisionAsked } from './readRevisionAsked';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent, url }) => {
	const { organisation } = await parent();
	const place = { organisationId: organisation.id, pageId: params.pageId };
	const page = await readBusinessBrainPageWhole(locals.supabase, place.organisationId, place.pageId);
	if (page === null) error(404, 'Page not found');
	const [history, links, files, parentPage, revision] = await Promise.all([
		readBusinessBrainPageHistory(locals.supabase, place.organisationId, place.pageId),
		readBusinessBrainPageLinks(locals.supabase, place.organisationId, place.pageId),
		readFilesNamedByPage(locals.supabase, place),
		readBusinessBrainParentPage(locals.supabase, place.organisationId, page.parentPageId),
		readRevisionAsked(locals.supabase, place, url)
	]);
	return { page, history, links, files, parentPage, revision };
};
