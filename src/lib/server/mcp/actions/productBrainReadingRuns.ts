import { readBrainIndexOfParts } from '$lib/server/businessBrain/readBusinessBrainIndex';
import { readBusinessBrainPageWhole } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import { readPartsTiedTo } from '$lib/server/businessBrain/productBrainParts';
import { searchBusinessBrainParts } from '$lib/server/businessBrain/searchBusinessBrain';
import {
	validateBusinessBrainPageAsked,
	validateBusinessBrainPart,
	validateBusinessBrainSearch
} from '$lib/server/businessBrain/validateBusinessBrainReading';
import { describeBusinessBrainIndex, describeBusinessBrainSearch, searchNotReadyYet } from './businessBrainListings';
import { describeBusinessBrainPage } from './describeBusinessBrainPage';
import { keepCoveredSurroundings, type CoveredParts } from './chatbotPageSurroundings';
import { noSuchPageInProductBrain, productBrainEmpty } from './describeProductBrain';
import { productDoor } from './businessBrainDoor';
import { readRevisionOfPage, readSurroundings } from './businessBrainReadingRuns';
import type { McpCaller } from '../resolveMcpCaller';
import type { ModuleProduct } from '../organisationModuleGate';

/** The index of the parts tied to the product, or of the one part asked when it is tied. */
export async function readIndexOfProductBrain(caller: McpCaller, input: Record<string, unknown>, product: ModuleProduct): Promise<string> {
	const asked = validateBusinessBrainPart(input);
	if (typeof asked === 'string') return asked;
	const { organisationId, parts } = await readCoveredParts(caller, product);
	if (parts.length === 0) return productBrainEmpty(product);
	const { part } = asked;
	const partsAsked = part === null ? parts : parts.filter((tied) => tied === part);
	const index = await readBrainIndexOfParts(caller.supabase, organisationId, partsAsked);
	return describeBusinessBrainIndex(productDoor(product), index);
}

/** The pages in the parts tied to the product that match the words, best first. */
export async function searchProductBrain(caller: McpCaller, input: Record<string, unknown>, product: ModuleProduct): Promise<string> {
	const asked = validateBusinessBrainSearch(input);
	if (typeof asked === 'string') return asked;
	const { organisationId, parts } = await readCoveredParts(caller, product);
	if (parts.length === 0) return productBrainEmpty(product);
	const matches = await searchBusinessBrainParts(caller.supabase, organisationId, asked.searchText, parts);
	if (matches === null) return searchNotReadyYet;
	return describeBusinessBrainSearch(productDoor(product), asked.searchText, matches);
}

/** One page in the parts tied to the product, or an earlier version of it; any other page is refused as if absent. */
export async function readPageOfProductBrain(caller: McpCaller, input: Record<string, unknown>, product: ModuleProduct): Promise<string> {
	const asked = validateBusinessBrainPageAsked(input);
	if (typeof asked === 'string') return asked;
	const { supabase } = caller;
	const covered = await readCoveredParts(caller, product);
	const page = await readBusinessBrainPageWhole(supabase, covered.organisationId, asked.pageId);
	const isCovered = page !== null && covered.parts.includes(page.partKind);
	if (!isCovered) return noSuchPageInProductBrain;
	const door = productDoor(product);
	const { revisionId } = asked;
	if (revisionId !== null) return readRevisionOfPage(supabase, door, page, { organisationId: covered.organisationId, revisionId });
	const surroundings = await readSurroundings(supabase, covered.organisationId, page);
	const coveredSurroundings = await keepCoveredSurroundings(supabase, covered, surroundings);
	return describeBusinessBrainPage(door, page, coveredSurroundings);
}

async function readCoveredParts(caller: McpCaller, product: ModuleProduct): Promise<CoveredParts> {
	const { organisation, project } = product;
	const place = { organisationId: organisation.id, projectId: project.id };
	return { organisationId: organisation.id, parts: await readPartsTiedTo(caller.supabase, place) };
}
