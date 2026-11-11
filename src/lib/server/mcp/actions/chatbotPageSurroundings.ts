import { readPagePartKinds } from '$lib/server/businessBrain/readPagePartKinds';
import type { BusinessBrainPageSurroundings } from './describeBusinessBrainPage';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { SupabaseClient } from '@supabase/supabase-js';

type ParentPage = BusinessBrainPageSurroundings['parent'];

/** The parts of an organisation's brain one door reads: a chatbot's parts, or a product's. */
export type CoveredParts = { organisationId: string; parts: BusinessBrainPartKind[] };

/** The page's surroundings with only the related pages the door also reads, so no other page's title shows through it. */
export async function keepCoveredSurroundings(
	supabase: SupabaseClient,
	covered: CoveredParts,
	surroundings: BusinessBrainPageSurroundings
): Promise<BusinessBrainPageSurroundings> {
	const { parent, links, history } = surroundings;
	const relatedPageIds = [...links.map((link) => link.pageId), ...parentPageIds(parent)];
	const partOfPage = await readPagePartKinds(supabase, covered.organisationId, relatedPageIds);
	const isCovered = (pageId: string) => isPartRead(covered, partOfPage.get(pageId));
	return { parent: keepParentIfCovered(parent, isCovered), links: links.filter((link) => isCovered(link.pageId)), history };
}

function parentPageIds(parent: ParentPage): string[] {
	if (parent === null) return [];
	return [parent.pageId];
}

function keepParentIfCovered(parent: ParentPage, isCovered: (pageId: string) => boolean): ParentPage {
	if (parent === null) return null;
	const isParentCovered = isCovered(parent.pageId);
	if (!isParentCovered) return null;
	return parent;
}

function isPartRead(covered: CoveredParts, part: BusinessBrainPartKind | undefined): boolean {
	if (part === undefined) return false;
	return covered.parts.includes(part);
}
