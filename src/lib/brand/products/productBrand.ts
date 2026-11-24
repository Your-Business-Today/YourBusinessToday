/** A product of an organisation that holds a brand of its own: its project, and what the brand is. */
export type ProductBrand = { projectId: string; projectName: string; summary: string };

export function productBrandPathOf(organisationId: string, projectId: string): string {
	return `/organisations/${organisationId}/brand/products/${projectId}`;
}
