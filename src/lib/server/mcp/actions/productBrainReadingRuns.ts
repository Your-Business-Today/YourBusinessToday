import { readBrainIndexOfParts, readIndexOfProductPages, type BusinessBrainIndex } from '$lib/server/businessBrain/readBusinessBrainIndex';
import { readPageProduct } from '$lib/server/businessBrain/readPageProduct';
import { readBusinessBrainPageWhole } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import { readPartsTiedTo } from '$lib/server/businessBrain/productBrainParts';
import { searchProductBrainPages } from '$lib/server/businessBrain/searchBusinessBrain';
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
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { McpCaller } from '../resolveMcpCaller';
import type { ModuleProduct } from '../organisationModuleGate';

/** The product's own pages first, then the index of the parts tied to it, or of the one part asked. */
export async function readIndexOfProductBrain(caller: McpCaller, input: Record<string, unknown>, product: ModuleProduct): Promise<string> {
	const asked = validateBusinessBrainPart(input);
	if (typeof asked === 'string') return asked;
	const { supabase } = caller;
	const { organisationId, parts } = await readCoveredParts(caller, product);
	const { project } = product;
	const own = await readIndexOfProductPages(supabase, { organisationId, projectId: project.id });
	if (parts.length + own.pageCount === 0) return productBrainEmpty(product);
	const { part } = asked;
	const partsAsked = part === null ? parts : parts.filter((tied) => tied === part);
	const tied = await readBrainIndexOfParts(supabase, organisationId, partsAsked);
	return describeBusinessBrainIndex(productDoor(product), ownFirst(own, tied, part));
}

function ownFirst(own: BusinessBrainIndex, tied: BusinessBrainIndex, part: BusinessBrainPartKind | null): BusinessBrainIndex {
	const { entries, pageCount } = own;
	const ownAsked = entries.filter((entry) => part === null || entry.partKind === part);
	const ownUnlisted = pageCount - entries.length;
	return { entries: [...ownAsked, ...tied.entries], pageCount: ownAsked.length + ownUnlisted + tied.pageCount };
}

/** The product's own pages that match the words, then those in the parts tied to it, best first. */
export async function searchProductBrain(caller: McpCaller, input: Record<string, unknown>, product: ModuleProduct): Promise<string> {
	const asked = validateBusinessBrainSearch(input);
	if (typeof asked === 'string') return asked;
	const { organisationId, parts } = await readCoveredParts(caller, product);
	const { project } = product;
	const scope = { organisationId, projectId: project.id };
	const matches = await searchProductBrainPages(caller.supabase, scope, asked.searchText, parts);
	if (matches === null) return searchNotReadyYet;
	if (parts.length + matches.length === 0) return productBrainEmpty(product);
	return describeBusinessBrainSearch(productDoor(product), asked.searchText, matches);
}

/** One page in the parts tied to the product, or an earlier version of it; any other page is refused as if absent. */
export async function readPageOfProductBrain(caller: McpCaller, input: Record<string, unknown>, product: ModuleProduct): Promise<string> {
	const asked = validateBusinessBrainPageAsked(input);
	if (typeof asked === 'string') return asked;
	const { supabase } = caller;
	const covered = await readCoveredParts(caller, product);
	const page = await readBusinessBrainPageWhole(supabase, covered.organisationId, asked.pageId);
	if (page === null) return noSuchPageInProductBrain;
	const owner = await readPageProduct(supabase, covered.organisationId, page.pageId);
	const { project } = product;
	const isCovered = owner === null ? covered.parts.includes(page.partKind) : owner === project.id;
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
