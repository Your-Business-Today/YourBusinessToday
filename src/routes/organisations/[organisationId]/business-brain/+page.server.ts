import { readBusinessBrainChatbots } from '$lib/server/businessBrain/readBusinessBrainChatbots';
import { readBusinessBrainDrawing } from '$lib/server/businessBrain/readBusinessBrainDrawing';
import { readBusinessBrainIndex } from '$lib/server/businessBrain/readBusinessBrainIndex';
import { readListedBusinessBrainFiles } from '$lib/server/businessBrain/readListedBusinessBrainFiles';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { PageServerLoad } from './$types';

const everyPart = null;
const everyBrain = null;
const noBrainsShown: BusinessBrainChatbot[] = [];

async function readBrainsWithQuestionRecords(supabase: SupabaseClient, organisationId: string, canManage: boolean) {
	if (!canManage) return noBrainsShown;
	return readBusinessBrainChatbots(supabase, organisationId, everyBrain);
}

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { organisation, canManage } = await parent();
	const [index, listedFiles, drawing, brainsWithRecords] = await Promise.all([
		readBusinessBrainIndex(locals.supabase, organisation.id, everyPart),
		readListedBusinessBrainFiles(locals.supabase, organisation.id),
		readBusinessBrainDrawing(locals.supabase, organisation.id),
		readBrainsWithQuestionRecords(locals.supabase, organisation.id, canManage)
	]);
	return { index, listedFiles, drawing, brainsWithRecords };
};
