import { readBusinessBrainChatbots } from '$lib/server/businessBrain/readBusinessBrainChatbots';
import { readBusinessBrainIndex } from '$lib/server/businessBrain/readBusinessBrainIndex';
import { readKeptBusinessBrainFiles } from '$lib/server/businessBrain/readKeptBusinessBrainFiles';
import type { PageServerLoad } from './$types';

const everyPart = null;
const everyChatbot = null;

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { organisation } = await parent();
	const [index, chatbots, keptFiles] = await Promise.all([
		readBusinessBrainIndex(locals.supabase, organisation.id, everyPart),
		readBusinessBrainChatbots(locals.supabase, organisation.id, everyChatbot),
		readKeptBusinessBrainFiles(locals.supabase, organisation.id)
	]);
	return { index, chatbots, keptFiles };
};
