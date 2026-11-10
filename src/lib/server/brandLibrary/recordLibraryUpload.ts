import type { SupabaseClient } from '@supabase/supabase-js';
import { brandLibraryHome } from './brandLibraryStorage';
import { findSentLibraryUpload } from './findLibraryItems';
import { recordArrivedUpload, uploadRecordings, type UploadRecording } from '$lib/server/storage/recordArrivedUpload';
import type { LibraryAdder } from './grantLibraryUpload';

/** What recording an item's file found, or that no upload of that id was granted to this person on this brand. */
export type LibraryUploadRecording = UploadRecording | { status: 'not_granted' };

export const libraryUploadRecordings = { ...uploadRecordings, notGranted: 'not_granted' } as const;

/** Keeps the photo or video that arrived at a link this person was granted, at the size that arrived. */
export async function recordLibraryUpload(supabase: SupabaseClient, adder: LibraryAdder, itemId: string): Promise<LibraryUploadRecording> {
	const upload = await findSentLibraryUpload(supabase, adder, itemId);
	if (upload === null) return { status: 'not_granted' };
	return recordArrivedUpload(supabase, brandLibraryHome, upload);
}
