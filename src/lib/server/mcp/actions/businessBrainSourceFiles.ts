import { findArrivedFileIds } from '$lib/server/businessBrain/findBusinessBrainFiles';
import { sourceFilesNotArrived } from './businessBrainFileAnswers';
import { validateSourceFileIds } from '$lib/data/businessBrainFileRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The source files a page is to name, each one a file of the organisation that has arrived, or a sentence saying which is not. */
export async function sourceFilesToName(
	supabase: SupabaseClient,
	organisationId: string,
	input: Record<string, unknown>
): Promise<string[] | string> {
	const fileIds = validateSourceFileIds(input.sourceFileIds);
	if (typeof fileIds === 'string') return fileIds;
	const arrivedFileIds = await findArrivedFileIds(supabase, organisationId, fileIds);
	const missingFileIds = fileIds.filter((fileId) => !arrivedFileIds.includes(fileId));
	if (missingFileIds.length > 0) return sourceFilesNotArrived(missingFileIds);
	return fileIds;
}
