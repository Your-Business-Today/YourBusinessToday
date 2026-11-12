import { businessBrainPartNames, type BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import { brainOf } from './businessBrainAnswers';
import type { ModuleProduct } from '../organisationModuleGate';

export const noSuchProductOfOrganisation =
	'The organisation has no product by that projectId. Call list_projects for its products.';

export const noPartsToChange = 'Name the parts to change: addParts or removeParts. Nothing was changed.';

export const noSuchPageInProductBrain =
	"The product's brain has no page by that pageId. Call read_product_brain_index for the pages it holds.";

/** What the product's brain reads now, after a change. */
export function productBrainChanged(product: ModuleProduct, parts: BusinessBrainPartKind[]): string {
	const { organisation, project } = product;
	if (parts.length === 0) return `${project.name} now reads no part of ${brainOf(organisation)}.`;
	const partNames = parts.map((part) => businessBrainPartNames[part]).join(', ');
	return `${project.name} now reads these parts of ${brainOf(organisation)}: ${partNames}. The people on it read them with read_product_brain_index.`;
}

/** A product no part is tied to yet. */
export function productBrainEmpty(product: ModuleProduct): string {
	const { organisation, project } = product;
	return `No part of ${brainOf(organisation)} is tied to ${project.name} yet. A manager of ${organisation.name} ties parts with change_product_brain.`;
}
