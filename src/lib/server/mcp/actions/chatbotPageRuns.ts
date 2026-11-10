import { readBusinessBrainPageWhole } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import { readBusinessBrainRevision } from '$lib/server/businessBrain/readBusinessBrainPageHistory';
import { validateBusinessBrainPageAsked, type BusinessBrainPageAsked } from '$lib/server/businessBrain/validateBusinessBrainReading';
import { describeBusinessBrainPage, describeBusinessBrainRevision, noSuchRevision } from './describeBusinessBrainPage';
import { noSuchPageThroughChatbot } from './describeChatbotReading';
import { readSurroundings } from './businessBrainReadingRuns';
import { keepCoveredSurroundings } from './chatbotPageSurroundings';
import { pageAsListed, readingThatGave, refusedReading } from './chatbotReadingResults';
import { chatbotDoor } from './businessBrainDoor';
import type { BusinessBrainPageRead } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import type { ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import type { ChatbotReading } from '$lib/data/businessBrainChatbotTrailRules';
import type { McpCaller } from '../resolveMcpCaller';

/** One page the chatbot reads, or one earlier version of it; a page in a part it does not read is refused as if absent. */
export async function readChatbotPage(caller: McpCaller, input: Record<string, unknown>, reach: ChatbotReach): Promise<ChatbotReading> {
	const asked = validateBusinessBrainPageAsked(input);
	if (typeof asked === 'string') return refusedReading(asked);
	const { organisation, chatbot } = reach;
	const page = await readBusinessBrainPageWhole(caller.supabase, organisation.id, asked.pageId);
	const isCovered = page !== null && chatbot.parts.includes(page.partKind);
	if (!isCovered) return refusedReading(noSuchPageThroughChatbot, asked);
	if (asked.revisionId !== null) return readEarlierVersion(caller, reach, page, asked);
	return readCurrentVersion(caller, reach, page, asked);
}

async function readCurrentVersion(
	caller: McpCaller,
	reach: ChatbotReach,
	page: BusinessBrainPageRead,
	asked: BusinessBrainPageAsked
): Promise<ChatbotReading> {
	const { supabase } = caller;
	const { organisation } = reach;
	const surroundings = await readSurroundings(supabase, organisation.id, page);
	const covered = await keepCoveredSurroundings(supabase, reach, surroundings);
	const answer = describeBusinessBrainPage(chatbotDoor(reach), page, covered);
	return readingThatGave(answer, asked, [pageAsListed(page)]);
}

async function readEarlierVersion(
	caller: McpCaller,
	reach: ChatbotReach,
	page: BusinessBrainPageRead,
	asked: BusinessBrainPageAsked
): Promise<ChatbotReading> {
	const { organisation } = reach;
	const place = { organisationId: organisation.id, pageId: page.pageId };
	const revisionId = asked.revisionId as number;
	const revision = await readBusinessBrainRevision(caller.supabase, place, revisionId);
	if (revision === null) return refusedReading(noSuchRevision, asked);
	const answer = describeBusinessBrainRevision(chatbotDoor(reach), page, revision);
	const versionGiven = { pageId: page.pageId, title: revision.title, filedAt: revision.revisedAt, revisionId };
	return readingThatGave(answer, asked, [versionGiven]);
}
