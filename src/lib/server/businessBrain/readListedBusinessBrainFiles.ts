import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainFileLimits } from '$lib/data/businessBrainFileRules';
import { keptFileColumns, parseKeptFile, type KeptBusinessBrainFile } from './readKeptBusinessBrainFiles';

/** A kept file as the Files tab lists it: the file, and whether any page names it as written from. */
export type ListedBusinessBrainFile = KeptBusinessBrainFile & { isNamedByPage: boolean };

/** The latest kept files, and how many the brain keeps in all. */
export type ListedBusinessBrainFiles = { files: ListedBusinessBrainFile[]; fileCount: number };

const lastListedRow = businessBrainFileLimits.mostFilesListed - 1;

function parseListedFile(row: Record<string, unknown>): ListedBusinessBrainFile {
	const namingPages = (row.business_brain_page_files as unknown[] | null) ?? [];
	return { ...parseKeptFile(row), isNamedByPage: namingPages.length > 0 };
}

/** Every file the organisation's brain keeps, latest first, each saying whether a page names it yet. */
export async function readListedBusinessBrainFiles(supabase: SupabaseClient, organisationId: string): Promise<ListedBusinessBrainFiles> {
	const { data, error, count } = await supabase
		.from('business_brain_files')
		.select(`${keptFileColumns}, business_brain_page_files(file_id)`, { count: 'exact' })
		.eq('organisation_id', organisationId)
		.not('recorded_at', 'is', null)
		.order('recorded_at', { ascending: false })
		.range(0, lastListedRow);
	if (error) throw error;
	const files = (data ?? []).map(parseListedFile);
	return { files, fileCount: count ?? files.length };
}
