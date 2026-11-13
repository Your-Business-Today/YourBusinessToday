import { readBusinessBrainDrawing } from '$lib/server/businessBrain/readBusinessBrainDrawing';
import { readBusinessBrainIndex } from '$lib/server/businessBrain/readBusinessBrainIndex';
import { readListedBusinessBrainFiles } from '$lib/server/businessBrain/readListedBusinessBrainFiles';
import type { PageServerLoad } from './$types';

const everyPart = null;

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { organisation } = await parent();
	const [index, listedFiles, drawing] = await Promise.all([
		readBusinessBrainIndex(locals.supabase, organisation.id, everyPart),
		readListedBusinessBrainFiles(locals.supabase, organisation.id),
		readBusinessBrainDrawing(locals.supabase, organisation.id)
	]);
	return { index, listedFiles, drawing };
};
