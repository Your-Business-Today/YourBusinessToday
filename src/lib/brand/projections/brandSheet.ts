import { listSection, paletteSection, sheetPlaceOf, typeSection, unmappedSection, type SheetPlace } from './brandSheetSections';
import { styledFacets } from './cssVariables';
import type { ResolvedBrand } from '../resolution/resolvedBrand';
import type { TraitDefinition } from '../traits/traitDefinition';

export type BrandSheetSubject = { brandName: string; projectName: string; readOn: string };

/**
 * The brand as a project's brand sheet (docs/design/brand.md), in the shape the project-process kit's
 * widget-design skill builds widgets to: every look and motion token with its role, and what is not yet decided.
 */
export function brandSheetOf(subject: BrandSheetSubject, brand: ResolvedBrand): string {
	const styled = brand.traits.filter(isStyled);
	const placed = (place: SheetPlace) => styled.filter((trait) => sheetPlaceOf(trait) === place);
	const { medium, gaps, problems } = brand;
	const unmapped = { withoutToken: placed('noToken'), gaps: gaps.filter(isStyled), problems, mediumLabel: medium.label };
	return [
		'# Brand',
		sourcesLine(subject, brand),
		paletteSection(placed('palette')),
		typeSection(placed('type')),
		listSection('## Spacing', placed('spacing')),
		listSection('## Radius · Elevation · Motion', placed('shapeAndMotion')),
		unmappedSection(unmapped)
	].join('\n\n');
}

function isStyled(trait: TraitDefinition): boolean {
	return styledFacets.includes(trait.facet);
}

function sourcesLine({ brandName, projectName, readOn }: BrandSheetSubject, { medium }: ResolvedBrand): string {
	const kit = `${brandName}'s brand kit in Your Business Today, as it holds for ${medium.label} (${medium.path})`;
	const tokens = 'Each token is a CSS custom property the theme sets once to the kit’s value.';
	return `Sources: ${kit}, for ${projectName}, read ${readOn}. ${tokens}`;
}
