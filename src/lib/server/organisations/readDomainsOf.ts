import { getProjectBlueprint } from '$lib/server/blueprint/getProjectBlueprint';
import { productDomainOf, type ProductDomain } from '$lib/data/organisationProductDomains';
import type { SupabaseClient } from '@supabase/supabase-js';

type Product = { id: string; name: string };

const noRepository = '';

/**
 * Each product's domain as last read from its repository, all read at once. A project with no repository is
 * internal, not a product, so it has no domain to show.
 */
export async function readDomainsOf(supabase: SupabaseClient, projects: Product[]): Promise<ProductDomain[]> {
	const productIds = await getIdsWithRepository(supabase, projects.map((project) => project.id));
	const products = projects.filter((project) => productIds.has(project.id));
	return Promise.all(products.map((product) => domainOfProduct(supabase, product)));
}

async function getIdsWithRepository(supabase: SupabaseClient, projectIds: string[]): Promise<Set<string>> {
	if (projectIds.length === 0) return new Set();
	const { data, error } = await supabase.from('projects').select('id').in('id', projectIds).neq('repository_url', noRepository);
	if (error) throw error;
	return new Set(data.map((row) => row.id as string));
}

async function domainOfProduct(supabase: SupabaseClient, project: Product): Promise<ProductDomain> {
	const blueprint = await getProjectBlueprint(supabase, project.id);
	return productDomainOf({ project, domain: blueprint?.domain ?? null });
}
