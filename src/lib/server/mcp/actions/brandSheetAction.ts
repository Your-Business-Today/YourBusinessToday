import { brandSheetOf } from '$lib/brand/projections/brandSheet';
import { findMedium } from '$lib/brand/mediums/mediumCatalogue';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, readText, textField, type McpAction } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { brandHolderOfInput, notAProjectOf } from './brandHolderOfInput';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { resolveBrandKitFor } from '$lib/server/brandKits/resolveBrandKitFor';
import type { BrandHolder } from '$lib/server/brandKits/brandHolder';
import type { McpCaller } from '../resolveMcpCaller';
import type { Medium } from '$lib/brand/mediums/mediumDefinition';

const brandModule = 'brand';
const websitePath = 'web.site';
const website = findMedium(websitePath) as Medium;
const isoDateCharacters = 10;

export { notAProjectOf };

function today(): string {
	return new Date().toISOString().slice(0, isoDateCharacters);
}

export const brandSheetAction: McpAction = moduleAction(brandModule, {
	name: 'read_brand_sheet',
	area: 'brand',
	audience: 'everyone',
	isWrite: false,
	summary:
		'a project’s brand sheet, written from the product’s own brand kit over its organisation’s: every colour, type, spacing, radius, elevation and motion token with its role',
	guidance:
		'For a build session on one of the organisation’s projects, before building or changing a widget. Write the answer whole as the ' +
		'repository’s docs/design/brand.md, as the project-process kit’s widget-design skill says, rather than extracting the brand by ' +
		'hand: name it as `brand` and the kit as a `brandSources` entry in docs/design/widgets.json, set each token once in the site’s ' +
		'theme to the value shown, and show the person the sheet and its Unmapped list before committing. It reads the brand as it holds ' +
		`for ${website.label} (${websitePath}): the product’s own decisions where it has a brand of its own, and its organisation’s for every trait it leaves undecided. ` +
		'Anything under Unmapped is settled in the kit with record_brand_decisions (with the projectId for the product’s own brand), never by ' +
		'editing the sheet. The voice, behaviour and audience are not on the sheet: resolve_brand gives them as the brief.',
	inputSchema: objectSchema(
		{
			organisationId: organisationIdField,
			projectId: textField('The organisation’s project the sheet is for, as list_projects gives it')
		},
		['organisationId', 'projectId']
	),
	run: async (caller, input, organisation) => {
		const isProjectNamed = readText(input, 'projectId') !== '';
		if (!isProjectNamed) return notAProjectOf(organisation.name);
		const holder = await brandHolderOfInput(caller, input, organisation);
		if ('refusal' in holder) return holder.refusal;
		const resolved = await resolveBrandKitFor(caller.supabase, holder, website);
		const subject = { brandName: await sheetBrandNameOf(caller, holder), projectName: holder.name, readOn: today() };
		return brandSheetOf(subject, resolved);
	}
});

async function sheetBrandNameOf(caller: McpCaller, holder: BrandHolder): Promise<string> {
	const productSummary = await findBrandSummary(caller.supabase, holder.owner);
	if (productSummary === null) return holder.organisationName;
	return holder.name;
}
