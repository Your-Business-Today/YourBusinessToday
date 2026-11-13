import { brainOf } from './businessBrainAnswers';
import type { ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** How the reader came to the brain: what to call what they read, and the action that reads a page the same way. */
export type BusinessBrainDoor = { brainName: string; readPageAction: string };

/** The organisation's whole brain, as someone on the organisation reads it. */
export function organisationDoor(organisation: Organisation): BusinessBrainDoor {
	return { brainName: brainOf(organisation), readPageAction: 'read_business_brain_page' };
}

/** The parts of the brain a chatbot reads, as a person it names reads them. */
export function chatbotDoor(reach: ChatbotReach): BusinessBrainDoor {
	const { organisation, chatbot } = reach;
	return { brainName: `${brainOf(organisation)} through the chatbot "${chatbot.name}"`, readPageAction: 'read_chatbot_page' };
}
