import { readBusinessBrainChatbots } from './readBusinessBrainChatbots';
import { readBusinessBrainDrawing } from './readBusinessBrainDrawing';
import { readBusinessBrainIndex, type BusinessBrainIndex } from './readBusinessBrainIndex';
import { readListedBusinessBrainFiles, type ListedBusinessBrainFiles } from './readListedBusinessBrainFiles';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { BusinessBrainDrawing } from '$lib/data/businessBrainDrawing';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Everything the brain's own page shows: the drawn brain, its pages, its kept files and the brains with question records. */
export type BusinessBrainForPage = {
	index: BusinessBrainIndex;
	listedFiles: ListedBusinessBrainFiles;
	drawing: BusinessBrainDrawing;
	brainsWithRecords: BusinessBrainChatbot[];
};

const everyPart = null;
const everyBrain = null;
const noBrainsShown: BusinessBrainChatbot[] = [];

async function readBrainsWithQuestionRecords(supabase: SupabaseClient, organisationId: string, canManage: boolean) {
	if (!canManage) return noBrainsShown;
	return readBusinessBrainChatbots(supabase, organisationId, everyBrain);
}

/** The organisation's brain as its page shows it, wherever the page is reached from. */
export async function readBusinessBrainForPage(
	supabase: SupabaseClient,
	organisationId: string,
	canManage: boolean
): Promise<BusinessBrainForPage> {
	const [index, listedFiles, drawing, brainsWithRecords] = await Promise.all([
		readBusinessBrainIndex(supabase, organisationId, everyPart),
		readListedBusinessBrainFiles(supabase, organisationId),
		readBusinessBrainDrawing(supabase, organisationId),
		readBrainsWithQuestionRecords(supabase, organisationId, canManage)
	]);
	return { index, listedFiles, drawing, brainsWithRecords };
}
