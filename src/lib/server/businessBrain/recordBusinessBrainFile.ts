import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainFilesBucket } from './businessBrainFileStorage';
import { recordArrivedUpload, uploadRecordings, type UploadRecording } from '$lib/server/storage/recordArrivedUpload';
import type { BusinessBrainFile } from './businessBrainFileRecord';

/** What recording a granted file found: it arrived and is kept, it has not arrived yet, its link lapsed unused, or it was kept already. */
export type BusinessBrainFileRecording = UploadRecording;

export const businessBrainFileRecordings = uploadRecordings;

const businessBrainFileHome = { bucket: businessBrainFilesBucket, table: 'business_brain_files' };

/**
 * Keeps the file that arrived at a granted link, at the size that actually arrived. A file that
 * arrived is always kept, however late it is recorded; nothing here deletes one.
 */
export async function recordBusinessBrainFile(supabase: SupabaseClient, file: BusinessBrainFile): Promise<BusinessBrainFileRecording> {
	return recordArrivedUpload(supabase, businessBrainFileHome, file);
}
