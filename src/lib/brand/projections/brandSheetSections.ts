import { describeTraitValue, type TraitKind } from '../values/traitValue';
import { neverForOf } from './brandSheetRoles';
import { variableNameOf } from './cssVariables';
import type { ResolvedTrait } from '../resolution/resolvedBrand';
import type { TraitDefinition } from '../traits/traitDefinition';

export type SheetPlace = 'palette' | 'type' | 'spacing' | 'shapeAndMotion' | 'noToken';

const colourKind: TraitKind = 'colour';
const placesByPrefix: [string, SheetPlace][] = [
	['look.type.', 'type'],
	['look.space.', 'spacing'],
	['look.shape.', 'shapeAndMotion'],
	['motion.', 'shapeAndMotion']
];
const nothingDecided = 'Nothing decided in the kit yet.';
const nothingUnmapped = 'Nothing: every trait is decided and has a token.';
const cellDivider = '|';
const escapedCellDivider = '\\|';

/** Where a look or motion trait sits on the brand sheet; a trait no theme token holds is unmapped. */
export function sheetPlaceOf(trait: TraitDefinition): SheetPlace {
	if (trait.kind === colourKind) return 'palette';
	const match = placesByPrefix.find(([prefix]) => trait.key.startsWith(prefix));
	if (match === undefined) return 'noToken';
	const [, place] = match;
	return place;
}

export function paletteSection(traits: ResolvedTrait[]): string {
	const rows = traits.map((trait) => rowOf([tokenOf(trait), `${trait.label} · ${valueOf(trait)}`, trait.purpose, neverForOf(trait)]));
	return tableSection('## Palette', ['Token', 'Brand name', 'Role — use for', 'Never for'], rows);
}

export function typeSection(traits: ResolvedTrait[]): string {
	const rows = traits.map((trait) => rowOf([tokenOf(trait), valueOf(trait), `${trait.label}: ${trait.purpose}`]));
	return tableSection('## Type', ['Token / class', 'Size · weight · line', 'Role'], rows);
}

export function listSection(heading: string, traits: ResolvedTrait[]): string {
	if (traits.length === 0) return `${heading}\n${nothingDecided}`;
	const lines = traits.map((trait) => `- ${tokenOf(trait)} = ${valueOf(trait)}: ${trait.label}. ${trait.purpose}.`);
	return [heading, ...lines].join('\n');
}

export type Unmapped = { withoutToken: ResolvedTrait[]; gaps: TraitDefinition[]; problems: string[]; mediumLabel: string };

export function unmappedSection({ withoutToken, gaps, problems, mediumLabel }: Unmapped): string {
	const lines = [
		...withoutToken.map((trait) => `- Decided in the kit, with no token: ${trait.label} (${trait.key}) = ${valueOf(trait)}`),
		...gapLines(gaps, mediumLabel),
		...problems.map((problem) => `- Needs fixing in the kit: ${problem}`)
	];
	if (lines.length === 0) return `## Unmapped\n${nothingUnmapped}`;
	return ['## Unmapped', ...lines].join('\n');
}

function gapLines(gaps: TraitDefinition[], mediumLabel: string): string[] {
	if (gaps.length === 0) return [];
	return [`- Not decided in the kit for ${mediumLabel} yet: ${gaps.map((trait) => trait.key).join(', ')}`];
}

function tableSection(heading: string, columns: string[], rows: string[]): string {
	if (rows.length === 0) return `${heading}\n${nothingDecided}`;
	const rule = rowOf(columns.map(() => '---'));
	return [heading, rowOf(columns), rule, ...rows].join('\n');
}

function rowOf(cells: string[]): string {
	const escaped = cells.map((cell) => cell.replaceAll(cellDivider, escapedCellDivider));
	return `| ${escaped.join(' | ')} |`;
}

function tokenOf(trait: TraitDefinition): string {
	return `\`${variableNameOf(trait.key)}\``;
}

function valueOf(trait: ResolvedTrait): string {
	return describeTraitValue(trait.value);
}
