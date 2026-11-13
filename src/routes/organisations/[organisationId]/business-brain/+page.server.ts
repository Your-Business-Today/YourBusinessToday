import { readBusinessBrainChatbots } from '$lib/server/businessBrain/readBusinessBrainChatbots';
import { readBusinessBrainIndex } from '$lib/server/businessBrain/readBusinessBrainIndex';
import { readListedBusinessBrainFiles } from '$lib/server/businessBrain/readListedBusinessBrainFiles';
import type { PageServerLoad } from './$types';

const everyPart = null;
const everyBrain = null;

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { organisation } = await parent();
	const [index, brains, listedFiles] = await Promise.all([
		readBusinessBrainIndex(locals.supabase, organisation.id, everyPart),
		readBusinessBrainChatbots(locals.supabase, organisation.id, everyBrain),
		readListedBusinessBrainFiles(locals.supabase, organisation.id)
	]);
	return { index, brains, listedFiles };
};
