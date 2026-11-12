import { businessBrainPartNames } from '$lib/data/businessBrainRules';
import { formatBritishDate } from '$lib/data/britishDate';
import { countOf } from '$lib/data/countOf';
import { brainOf } from './businessBrainAnswers';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const noSuchChatbot =
	"This organisation's brain has no chatbot by that chatbotId. Call list_business_brain_chatbots for its chatbots.";

export const chatbotWouldReadNothing =
	'That would leave the chatbot reading no part of the brain; it keeps at least one. Nothing was changed.';

export function chatbotNameTaken(organisation: Organisation, name: string): string {
	return `${organisation.name} already has a chatbot called "${name}". Choose another name, or change that one with change_business_brain_chatbot.`;
}

export const noPurposeYet = 'not given yet; say it with change_business_brain_chatbot';

/** One chatbot as a manager reads it: what it is for, what it reads and who uses it. */
export function describeChatbot(chatbot: BusinessBrainChatbot): string[] {
	const { parts, people, purpose } = chatbot;
	const isPurposeGiven = purpose !== '';
	const partNames = parts.map((part) => businessBrainPartNames[part]);
	const reads = partNames.length === 0 ? 'no part of the brain' : partNames.join(', ');
	const usedBy = people.length === 0 ? 'nobody yet' : people.join(', ');
	const heading = `## ${chatbot.name}`;
	const made = `Chatbot id ${chatbot.chatbotId}, made ${formatBritishDate(chatbot.madeAt)}.`;
	const forWhat = isPurposeGiven ? purpose : noPurposeYet;
	return [heading, made, `- For: ${forWhat}`, `- Reads: ${reads}`, `- Used by: ${usedBy}`];
}

export function chatbotMade(organisation: Organisation, chatbot: BusinessBrainChatbot): string {
	return [`Made a chatbot onto ${brainOf(organisation)}.`, '', ...describeChatbot(chatbot)].join('\n');
}

export function chatbotChanged(organisation: Organisation, chatbot: BusinessBrainChatbot): string {
	return [`Changed a chatbot onto ${brainOf(organisation)}. It now stands so:`, '', ...describeChatbot(chatbot)].join('\n');
}

/** Every chatbot of the organisation, or a plain word that it has none. */
export function describeChatbots(organisation: Organisation, chatbots: BusinessBrainChatbot[]): string {
	if (chatbots.length === 0) return `${organisation.name} has no chatbots yet. A manager makes one with make_business_brain_chatbot.`;
	const heading = `# ${countOf(chatbots.length, 'chatbot')} onto ${brainOf(organisation)}`;
	return [heading, ...chatbots.flatMap((chatbot) => ['', ...describeChatbot(chatbot)])].join('\n');
}
