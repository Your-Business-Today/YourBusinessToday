import { error } from '@sveltejs/kit';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { getProject } from '$lib/server/projects/getProject';
import { productBrand } from '$lib/server/brandKits/brandKitOwner';
import { productHolder } from '$lib/server/brandKits/brandHolder';
import { readBrandKitPage } from '$lib/server/brandKits/readBrandKitPage';
import type { PageServerLoad } from './$types';

const notFound = 404;

/** A product's own brand, read over its organisation's, for a product of the organisation the page is under. */
export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { brandOrganisation } = await parent();
	const project = await getProject(locals.supabase, params.projectId);
	const isTheOrganisationsProduct = project !== null && project.organisationId === brandOrganisation.id;
	if (!isTheOrganisationsProduct) error(notFound, 'That product could not be found');
	const product = { id: project.id, name: project.name };
	const [kit, summary] = await Promise.all([
		readBrandKitPage(locals.supabase, productHolder(brandOrganisation, product)),
		findBrandSummary(locals.supabase, productBrand(project.id))
	]);
	return { product, kit, summary };
};
