import type { ProductBrand } from '$lib/brand/products/productBrand';
import type { SupabaseClient } from '@supabase/supabase-js';

type ProductBrandRow = { project_id: string; summary: string; projects: { name: string } };

/** The organisation's products that hold a brand of their own, by name. */
export async function findProductBrands(supabase: SupabaseClient, organisationId: string): Promise<ProductBrand[]> {
	const { data, error } = await supabase
		.from('project_brand_kits')
		.select('project_id, summary, projects!inner(name, organisation_id)')
		.eq('projects.organisation_id', organisationId);
	if (error) throw error;
	const rows = (data ?? []) as unknown as ProductBrandRow[];
	return rows.map(productBrandOf).sort((left, right) => left.projectName.localeCompare(right.projectName));
}

function productBrandOf(row: ProductBrandRow): ProductBrand {
	const { name } = row.projects;
	return { projectId: row.project_id, projectName: name, summary: row.summary };
}
