import { businessBrainPartNames } from '$lib/data/businessBrainRules';
import { countOf } from '$lib/data/countOf';
import { brainOf } from './businessBrainAnswers';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';

export const noChatbotsToUse =
	"You may use no chatbot onto Your Business Brain yet. An organisation's manager names you on one by the email you sign in to Your Business Today with.";

export const noSuchPageThroughChatbot =
	'This chatbot reads no page by that pageId. Find the pages it reads with read_chatbot_index or search_chatbot.';

export const chatbotSearchNotReadyYet =
	"Searching through a chatbot starts once this release's database change has run. Until then, read_chatbot_index lists every page the chatbot reads by title.";

function partNamesOf(chatbot: BusinessBrainChatbot): string {
	return chatbot.parts.map((part) => businessBrainPartNames[part]).join(', ');
}

/** Why a part the chatbot does not read is not listed, with the parts it does. */
export function partOutsideChatbot(chatbot: BusinessBrainChatbot): string {
	return `The chatbot "${chatbot.name}" does not read that part of the brain. It reads ${partNamesOf(chatbot)}; leave the part out to list all of them.`;
}

function chatbotLines(reach: ChatbotReach): string[] {
	const { organisation, chatbot } = reach;
	const heading = `## ${chatbot.name}`;
	const onto = `Chatbot id ${chatbot.chatbotId}, onto ${brainOf(organisation)}.`;
	return ['', heading, onto, `- Reads: ${partNamesOf(chatbot)}`];
}

/** The chatbots the person may use now, each with what it reads, or a plain word that there are none. */
export function describeChatbotsToUse(reaches: ChatbotReach[]): string {
	if (reaches.length === 0) return noChatbotsToUse;
	const heading = `# ${countOf(reaches.length, 'chatbot')} you may use`;
	const footer =
		"Read through one with read_chatbot_index, search_chatbot or read_chatbot_page, giving its chatbot id and the person's question. " +
		"Every question asked through a chatbot is kept on its organisation's record, which the manager reads.";
	return [heading, ...reaches.flatMap(chatbotLines), '', footer].join('\n');
}
