import { conversationChannelLabels, type LeadConversation } from '$lib/data/leadConversationRules';

const noneLogged = 'None logged yet. Log each one with log_lead_conversation when it has happened.';

/** The conversations kept on a lead, the latest first, each with what was said when it was kept. */
export function describeLeadConversations(conversations: LeadConversation[]): string[] {
	if (conversations.length === 0) return [noneLogged];
	return conversations.flatMap(conversationLines);
}

function conversationLines(conversation: LeadConversation): string[] {
	const withWhom = conversation.personName === '' ? '' : ` with ${conversation.personName}`;
	const how = conversationChannelLabels[conversation.channel];
	const heading = `- ${conversation.heldOn}, ${how}, ${conversation.heldByName}${withWhom}: ${conversation.summary}`;
	if (conversation.whatWasSaid === '') return [heading];
	return [heading, indented(conversation.whatWasSaid)];
}

function indented(text: string): string {
	return text
		.split('\n')
		.map((line) => `    ${line}`)
		.join('\n');
}
