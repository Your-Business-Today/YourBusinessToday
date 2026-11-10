import { brandBriefOf } from '$lib/brand/projections/brandBrief';
import { cssVariablesOf } from '$lib/brand/projections/cssVariables';
import { describeBrandCatalogue } from './describeBrandCatalogue';
import { describeBrandKit } from './describeBrandKit';
import { findMedium } from '$lib/brand/mediums/mediumCatalogue';
import { loadBrandKit } from '$lib/server/brandKits/loadBrandKit';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, readText, textField, type McpAction } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { resolveBrandKitFor } from '$lib/server/brandKits/resolveBrandKitFor';

const brandModule = 'brand';
const jsonIndent = 2;
const mediumField = textField('A medium path such as all, video.short.tiktok or text.email, as read_brand_catalogue lists');
const organisationOnly = objectSchema({ organisationId: organisationIdField }, ['organisationId']);

function notAMedium(path: string): string {
	return `${path || 'That'} is not a medium. Call read_brand_catalogue for the mediums.`;
}

export const brandKitReadActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'read_brand_catalogue',
		area: 'brand',
		audience: 'everyone',
		isWrite: false,
		summary: 'everything an organisation’s brand can decide: every facet, trait, kind, medium and action',
		inputSchema: organisationOnly,
		run: async (caller, _input, organisation) =>
			describeBrandCatalogue((await loadBrandKit(caller.supabase, organisation.id)).catalogue)
	}),
	moduleAction(brandModule, {
		name: 'read_brand',
		area: 'brand',
		audience: 'everyone',
		isWrite: false,
		summary: 'an organisation’s brand kit: every decision adopted or proposed, at every medium, and what is not decided yet',
		guidance: 'An organisation has one brand, so it is named by the organisation. A kit with nothing decided reads as empty, with every trait named as a gap.',
		inputSchema: organisationOnly,
		run: async (caller, _input, organisation) =>
			describeBrandKit(organisation.name, await loadBrandKit(caller.supabase, organisation.id))
	}),
	moduleAction(brandModule, {
		name: 'resolve_brand',
		area: 'brand',
		audience: 'everyone',
		isWrite: false,
		summary: 'an organisation’s brand as it holds for one medium: the brief to follow, the style variables and the gaps',
		guidance: 'Call this before writing, scripting or designing anything for the organisation, and follow the brief.',
		inputSchema: objectSchema({ organisationId: organisationIdField, medium: mediumField }, ['organisationId', 'medium']),
		run: async (caller, input, organisation) => {
			const mediumPath = readText(input, 'medium');
			const medium = findMedium(mediumPath);
			if (medium === null) return notAMedium(mediumPath);
			const resolved = await resolveBrandKitFor(caller.supabase, organisation.id, medium);
			const variables = JSON.stringify(cssVariablesOf(resolved), null, jsonIndent);
			return `${brandBriefOf(organisation.name, resolved)}\n\nStyle variables:\n${variables}`;
		}
	})
];
