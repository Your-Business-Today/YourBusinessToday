import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainFileLimits } from '$lib/data/businessBrainFileRules';

/** A file kept with an organisation's brain, as a reader is told of it: enough to choose whether to open it. */
export type KeptBusinessBrainFile = { fileId: string; filename: string; mimeType: string; byteCount: number; recordedAt: string };

/** How many files the brain keeps, and the kept files no page names yet, latest first. */
export type KeptBusinessBrainFiles = { keptCount: number; unnamed: KeptBusinessBrainFile[]; unnamedCount: number };

const keptFileColumns = 'id, filename, mime_type, byte_count, recorded_at';
const lastUnnamedRow = businessBrainFileLimits.mostUnnamedFilesListed - 1;

function parseKeptFile(row: Record<string, unknown>): KeptBusinessBrainFile {
	return {
		fileId: row.id as string,
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		byteCount: row.byte_count as number,
		recordedAt: row.recorded_at as string
	};
}

/** The kept files the page names as written from, by name. */
export async function readFilesNamedByPage(
	supabase: SupabaseClient,
	place: { organisationId: string; pageId: string }
): Promise<KeptBusinessBrainFile[]> {
	const fileIds = await readNamedFileIds(supabase, place);
	if (fileIds.length === 0) return [];
	const { data, error } = await supabase
		.from('business_brain_files')
		.select(keptFileColumns)
		.eq('organisation_id', place.organisationId)
		.in('id', fileIds)
		.not('recorded_at', 'is', null)
		.order('filename');
	if (error) throw error;
	return (data ?? []).map(parseKeptFile);
}

async function readNamedFileIds(supabase: SupabaseClient, place: { organisationId: string; pageId: string }): Promise<string[]> {
	const { data, error } = await supabase
		.from('business_brain_page_files')
		.select('file_id')
		.eq('organisation_id', place.organisationId)
		.eq('page_id', place.pageId);
	if (error) throw error;
	return (data ?? []).map((row) => row.file_id as string);
}

/** How many files the organisation's brain keeps, and those no page names, so none is out of reach. */
export async function readKeptBusinessBrainFiles(supabase: SupabaseClient, organisationId: string): Promise<KeptBusinessBrainFiles> {
	const keptCount = await countKeptFiles(supabase, organisationId);
	if (keptCount === 0) return { keptCount, unnamed: [], unnamedCount: 0 };
	const { data, error, count } = await supabase
		.from('business_brain_files')
		.select(`${keptFileColumns}, business_brain_page_files(file_id)`, { count: 'exact' })
		.eq('organisation_id', organisationId)
		.not('recorded_at', 'is', null)
		.is('business_brain_page_files', null)
		.order('recorded_at', { ascending: false })
		.range(0, lastUnnamedRow);
	if (error) throw error;
	const unnamed = (data ?? []).map(parseKeptFile);
	return { keptCount, unnamed, unnamedCount: count ?? unnamed.length };
}

async function countKeptFiles(supabase: SupabaseClient, organisationId: string): Promise<number> {
	const { count, error } = await supabase
		.from('business_brain_files')
		.select('id', { count: 'exact', head: true })
		.eq('organisation_id', organisationId)
		.not('recorded_at', 'is', null);
	if (error) throw error;
	return count ?? 0;
}
