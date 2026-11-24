/** Where a brand kit is kept: its three tables, the column that names whose kit a row is, and whose it is. */
export type BrandKitOwner = {
	kitsTable: string;
	traitsTable: string;
	decisionsTable: string;
	ownerColumn: string;
	ownerId: string;
};

type KitTables = Omit<BrandKitOwner, 'ownerId'>;

const organisationKitTables: KitTables = {
	kitsTable: 'brand_kits',
	traitsTable: 'brand_kit_traits',
	decisionsTable: 'brand_kit_decisions',
	ownerColumn: 'organisation_id'
};

const productKitTables: KitTables = {
	kitsTable: 'project_brand_kits',
	traitsTable: 'project_brand_kit_traits',
	decisionsTable: 'project_brand_kit_decisions',
	ownerColumn: 'project_id'
};

/** An organisation's own brand kit. */
export function organisationBrand(organisationId: string): BrandKitOwner {
	return { ...organisationKitTables, ownerId: organisationId };
}

/** A product's brand kit, kept on its project, read over its organisation's. */
export function productBrand(projectId: string): BrandKitOwner {
	return { ...productKitTables, ownerId: projectId };
}
