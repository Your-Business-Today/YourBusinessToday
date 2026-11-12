import type { SupabaseClient } from '@supabase/supabase-js';
import { isWebAddress } from '$lib/data/webAddress';

export type NewPersonLink = { label: string; url: string };

export function readNewPersonLink(formData: FormData): NewPersonLink | null {
	const label = String(formData.get('label') ?? '').trim();
	const url = String(formData.get('url') ?? '').trim();
	if (label === '' || !isWebAddress(url)) return null;
	return { label, url };
}

export async function addPersonLink(
	supabase: SupabaseClient,
	personId: string,
	link: NewPersonLink
): Promise<void> {
	const { error } = await supabase
		.from('person_links')
		.insert({ person_id: personId, label: link.label, url: link.url });
	if (error) throw error;
}
