import type { SupabaseClient } from '@supabase/supabase-js';
import type { TraitDefinition } from '$lib/brand/traits/traitDefinition';
import type { BrandKitOwner } from './brandKitOwner';

const uniqueViolation = '23505';

/** Keeps a trait the brand defines for itself; false when the brand already has a trait of that key. */
export async function keepBrandTrait(
	supabase: SupabaseClient,
	owner: BrandKitOwner,
	trait: TraitDefinition
): Promise<boolean> {
	const row = {
		[owner.ownerColumn]: owner.ownerId,
		key: trait.key,
		facet: trait.facet,
		kind: trait.kind,
		label: trait.label,
		purpose: trait.purpose,
		choices: trait.choices ?? []
	};
	const { error } = await supabase.from(owner.traitsTable).insert(row);
	if (error?.code === uniqueViolation) return false;
	if (error) throw error;
	return true;
}
