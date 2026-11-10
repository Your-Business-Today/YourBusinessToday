import { readBusinessBrainPageWhole } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import { readPagePartKinds } from '$lib/server/businessBrain/readPagePartKinds';
import { validateBusinessBrainPageAsked } from '$lib/server/businessBrain/validateBusinessBrainReading';
import { describeBusinessBrainPage, type BusinessBrainPageSurroundings } from './describeBusinessBrainPage';
import { noSuchPageThroughChatbot } from './describeChatbotReading';
import { readRevisionOfPage, readSurroundings } from './businessBrainReadingRuns';
import { chatbotDoor } from './businessBrainDoor';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import type { McpCaller } from '../resolveMcpCaller';
import type { SupabaseClient } from '@supabase/supabase-js';

type ParentPage = BusinessBrainPageSurroundings['parent'];

/** One page the chatbot reads, or one earlier version of it; a page in a part it does not read is refused as if absent. */
export async function readChatbotPage(caller: McpCaller, input: Record<string, unknown>, reach: ChatbotReach): Promise<string> {
	const asked = validateBusinessBrainPageAsked(input);
	if (typeof asked === 'string') return asked;
	const { supabase } = caller;
	const { organisation, chatbot } = reach;
	const page = await readBusinessBrainPageWhole(supabase, organisation.id, asked.pageId);
	const isCovered = page !== null && chatbot.parts.includes(page.partKind);
	if (!isCovered) return noSuchPageThroughChatbot;
	const door = chatbotDoor(reach);
	const { revisionId } = asked;
	if (revisionId !== null) return readRevisionOfPage(supabase, door, page, { organisationId: organisation.id, revisionId });
	const surroundings = await readSurroundings(supabase, organisation.id, page);
	const covered = await keepCoveredSurroundings(supabase, reach, surroundings);
	return describeBusinessBrainPage(door, page, covered);
}

/** The page's surroundings with only the related pages the chatbot also reads, so no other page's title shows through it. */
async function keepCoveredSurroundings(
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
