import { organisationBrand, productBrand, type BrandKitOwner } from './brandKitOwner';

type Named = { id: string; name: string };

/**
 * Whose brand is being read or set: an organisation's own, or a product's, which is read over its
 * organisation's so that whatever the product leaves undecided is the organisation's.
 */
export type BrandHolder = { name: string; owner: BrandKitOwner; organisationName: string; underlyingOwner: BrandKitOwner | null };

export function organisationHolder(organisation: Named): BrandHolder {
	const owner = organisationBrand(organisation.id);
	return { name: organisation.name, owner, organisationName: organisation.name, underlyingOwner: null };
}

export function productHolder(organisation: Named, project: Named): BrandHolder {
	const owner = productBrand(project.id);
	const underlyingOwner = organisationBrand(organisation.id);
	return { name: project.name, owner, organisationName: organisation.name, underlyingOwner };
}
