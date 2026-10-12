import type { SupabaseClient } from '@supabase/supabase-js';

export type SweptAuthority = { code: string; publishedOn: string | null; sweptAt: string | null };

/** What the last sweeps read: an authority whose file has not moved since is not read again. */
export async function readSweptAuthorities(supabase: SupabaseClient): Promise<Map<string, SweptAuthority>> {
	const { data, error } = await supabase.from('food_hygiene_authorities').select('code, published_at, swept_at');
	if (error) throw error;
	return new Map(
		data.map((row: Record<string, unknown>) => [
			row.code as string,
			{ code: row.code as string, publishedOn: (row.published_at ?? null) as string | null, sweptAt: (row.swept_at ?? null) as string | null }
		])
	);
}
