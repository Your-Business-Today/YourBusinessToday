import { brandBriefOf } from '$lib/brand/projections/brandBrief';
import { brandHolderOfInput, productProjectIdField } from './brandHolderOfInput';
import { cssVariablesOf } from '$lib/brand/projections/cssVariables';
import { describeBrandCatalogue } from './describeBrandCatalogue';
import { describeBrandKit } from './describeBrandKit';
import { findMedium } from '$lib/brand/mediums/mediumCatalogue';
import { loadHeldBrandKit } from '$lib/server/brandKits/loadHeldBrandKit';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, readText, textField, type McpAction } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { resolveBrandKitFor } from '$lib/server/brandKits/resolveBrandKitFor';

const brandModule = 'brand';
const jsonIndent = 2;
const mediumField = textField('A medium path such as all, video.short.tiktok or text.email, as read_brand_catalogue lists');
const brandOnly = objectSchema({ organisationId: organisationIdField, projectId: productProjectIdField }, ['organisationId']);

function notAMedium(path: string): string {
	return `${path || 'That'} is not a medium. Call read_brand_catalogue for the mediums.`;
}

export const brandKitReadActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'read_brand_catalogue',
		area: 'brand',
		audience: 'everyone',
		isWrite: false,
		summary: 'everything an organisation’s or a product’s brand can decide: every facet, trait, kind, medium and action',
		inputSchema: brandOnly,
		run: async (caller, input, organisation) => {
			const holder = await brandHolderOfInput(caller, input, organisation);
			if ('refusal' in holder) return holder.refusal;
			return describeBrandCatalogue((await loadHeldBrandKit(caller.supabase, holder)).catalogue);
		}
	}),
	moduleAction(brandModule, {
		name: 'read_brand',
		area: 'brand',
		audience: 'everyone',
		isWrite: false,
		summary: 'an organisation’s or a product’s brand kit: every decision adopted or proposed, at every medium, and what is not decided yet',
		guidance:
			'An organisation has one brand, named by the organisation; a product of it may hold its own, named by its projectId as well. ' +
			'A product’s kit reads over its organisation’s, so the decisions listed include the organisation’s for every trait the product has not decided. ' +
			'A kit with nothing decided reads as empty, with every trait named as a gap.',
		inputSchema: brandOnly,
		run: async (caller, input, organisation) => {
			const holder = await brandHolderOfInput(caller, input, organisation);
			if ('refusal' in holder) return holder.refusal;
			return describeBrandKit(holder.name, await loadHeldBrandKit(caller.supabase, holder));
		}
	}),
	moduleAction(brandModule, {
		name: 'resolve_brand',
		area: 'brand',
		audience: 'everyone',
		isWrite: false,
		summary: 'an organisation’s or a product’s brand as it holds for one medium: the brief to follow, the style variables and the gaps',
		guidance: 'Call this before writing, scripting or designing anything for the organisation or the product, and follow the brief.',
		inputSchema: objectSchema(
			{ organisationId: organisationIdField, projectId: productProjectIdField, medium: mediumField },
			['organisationId', 'medium']
		),
		run: async (caller, input, organisation) => {
			const mediumPath = readText(input, 'medium');
			const medium = findMedium(mediumPath);
			if (medium === null) return notAMedium(mediumPath);
			const holder = await brandHolderOfInput(caller, input, organisation);
			if ('refusal' in holder) return holder.refusal;
			const resolved = await resolveBrandKitFor(caller.supabase, holder, medium);
			const variables = JSON.stringify(cssVariablesOf(resolved), null, jsonIndent);
			return `${brandBriefOf(holder.name, resolved)}\n\nStyle variables:\n${variables}`;
		}
	})
];
