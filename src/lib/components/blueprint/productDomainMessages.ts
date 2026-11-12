/** Where the domain on a product's Domain tab is drawn from: the product brain's own pages, else its repository. */
export const productDomainSources = {
	productBrain: 'Drawn from the product brain',
	repository: 'Drawn from the repository'
} as const;

/** What the header says the domain is drawn from, or null when there is none to draw. */
export function domainDrawnFrom(hasOwnDomain: boolean, hasRepositoryDomain: boolean): string | null {
	if (hasOwnDomain) return productDomainSources.productBrain;
	if (hasRepositoryDomain) return productDomainSources.repository;
	return null;
}
