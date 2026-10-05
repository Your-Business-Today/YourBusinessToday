import type { SupabaseClient } from '@supabase/supabase-js';
import { attachmentsBucket } from './attachmentStorage';

export async function signUploadUrl(supabase: SupabaseClient, storagePath: string): Promise<string> {
	const { data, error } = await supabase.storage
		.from(attachmentsBucket)
		.createSignedUploadUrl(storagePath);
	if (error !== null) throw error;
	return data.signedUrl;
}

export async function isFileStored(supabase: SupabaseClient, storagePath: string): Promise<boolean> {
	const { data: isStored } = await supabase.storage
		.from(attachmentsBucket)
		.exists(storagePath);
	return isStored;
}
