import { readPagePartKinds } from '$lib/server/businessBrain/readPagePartKinds';
import type { BusinessBrainPageSurroundings } from './describeBusinessBrainPage';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import type { SupabaseClient } from '@supabase/supabase-js';

type ParentPage = BusinessBrainPageSurroundings['parent'];

/** The page's surroundings with only the related pages the chatbot also reads, so no other page's title shows through it. */
export async function keepCoveredSurroundings(
	supabase: SupabaseClient,
	reach: ChatbotReach,
	surroundings: BusinessBrainPageSurroundings
): Promise<BusinessBrainPageSurroundings> {
	const { parent, links, history } = surroundings;
	const { organisation, chatbot } = reach;
	const relatedPageIds = [...links.map((link) => link.pageId), ...parentPageIds(parent)];
	const partOfPage = await readPagePartKinds(supabase, organisation.id, relatedPageIds);
	const isCovered = (pageId: string) => isPartRead(chatbot, partOfPage.get(pageId));
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

function isPartRead(chatbot: BusinessBrainChatbot, part: BusinessBrainPartKind | undefined): boolean {
	if (part === undefined) return false;
	return chatbot.parts.includes(part);
}
