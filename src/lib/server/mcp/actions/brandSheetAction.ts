import { brandSheetOf } from '$lib/brand/projections/brandSheet';
import { findMedium } from '$lib/brand/mediums/mediumCatalogue';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, readText, textField, type McpAction } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { reachableProject } from '../projectAccess';
import { resolveBrandKitFor } from '$lib/server/brandKits/resolveBrandKitFor';
import type { Medium } from '$lib/brand/mediums/mediumDefinition';

const brandModule = 'brand';
const websitePath = 'web.site';
const website = findMedium(websitePath) as Medium;
const isoDateCharacters = 10;

export function notAProjectOf(organisationName: string): string {
	return `No project you are on belongs to ${organisationName} with that id. Call list_projects for yours; read_project names each one's organisation.`;
}

function today(): string {
	return new Date().toISOString().slice(0, isoDateCharacters);
}

export const brandSheetAction: McpAction = moduleAction(brandModule, {
	name: 'read_brand_sheet',
	area: 'brand',
	audience: 'everyone',
	isWrite: false,
	summary:
		'a project’s brand sheet, written from its organisation’s brand kit: every colour, type, spacing, radius, elevation and motion token with its role',
	guidance:
		'For a build session on one of the organisation’s projects, before building or changing a widget. Write the answer whole as the ' +
		'repository’s docs/design/brand.md, as the project-process kit’s widget-design skill says, rather than extracting the brand by ' +
		'hand: name it as `brand` and the kit as a `brandSources` entry in docs/design/widgets.json, set each token once in the site’s ' +
		'theme to the value shown, and show the person the sheet and its Unmapped list before committing. It reads the brand as it holds ' +
		`for ${website.label} (${websitePath}). Anything under Unmapped is settled in the kit with record_brand_decisions, never by ` +
		'editing the sheet. The voice, behaviour and audience are not on the sheet: resolve_brand gives them as the brief.',
	inputSchema: objectSchema(
		{
			organisationId: organisationIdField,
			projectId: textField('The organisation’s project the sheet is for, as list_projects gives it')
		},
		['organisationId', 'projectId']
	),
	run: async (caller, input, organisation) => {
		const project = await reachableProject(caller, readText(input, 'projectId'));
		const isTheOrganisationsProject = project !== null && project.organisationId === organisation.id;
		if (!isTheOrganisationsProject) return notAProjectOf(organisation.name);
		const resolved = await resolveBrandKitFor(caller.supabase, organisation.id, website);
		const subject = { brandName: organisation.name, projectName: project.name, readOn: today() };
		return brandSheetOf(subject, resolved);
	}
});
