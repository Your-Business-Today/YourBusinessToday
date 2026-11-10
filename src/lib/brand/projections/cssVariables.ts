import type { ResolvedBrand } from '../resolution/resolvedBrand';
import type { FacetKey } from '../facets';

export const styledFacets: FacetKey[] = ['look', 'motion'];
const variablePrefix = '--brand';

export function cssVariablesOf(brand: ResolvedBrand): Record<string, string> {
	const styled = brand.traits.filter((resolved) => styledFacets.includes(resolved.facet));
	const scalar = styled.filter(
		(resolved) => typeof resolved.value === 'string' || typeof resolved.value === 'number'
	);
	return Object.fromEntries(
		scalar.map((resolved) => [variableNameOf(resolved.key), String(resolved.value)])
	);
}

export function variableNameOf(traitKey: string): string {
	const withoutFacet = traitKey.split('.').slice(1).join('-');
	return `${variablePrefix}-${withoutFacet.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}
