import { isCalendarDate } from '$lib/data/calendarDate';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import {
	conversationChannels,
	isConversationChannel,
	leadConversationLimits,
	type LeadConversationLogged
} from '$lib/data/leadConversationRules';

const { longestSummary, longestWhatWasSaid } = leadConversationLimits;
const noPersonNamed = '';

export const leadConversationRefusals = {
	heldOn: 'The heldOn is the day the conversation happened, as YYYY-MM-DD.',
	channel: `The channel is one of ${conversationChannels.join(', ')}.`,
	summary: `The summary is 1 to ${longestSummary} characters: what the conversation came to, in a line.`,
	whatWasSaid: `What was said is at most ${longestWhatWasSaid} characters.`
} as const;

/** The conversation as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateLeadConversation(
	input: Record<string, unknown>,
	heldByAccountId: string
): LeadConversationLogged | string {
	const clientId = trimmedText(input.clientId);
	const clientRefusal = validateRecordId('clientId', clientId);
	if (clientRefusal !== null) return clientRefusal;
	const personIdText = trimmedText(input.personId);
	const isWithSomeoneNamed = personIdText !== noPersonNamed;
	const personRefusal = isWithSomeoneNamed ? validateRecordId('personId', personIdText) : null;
	if (personRefusal !== null) return personRefusal;
	const personId = isWithSomeoneNamed ? personIdText : null;
	const heldOn = trimmedText(input.heldOn);
	if (!isCalendarDate(heldOn)) return leadConversationRefusals.heldOn;
	const channel = trimmedText(input.channel);
	if (!isConversationChannel(channel)) return leadConversationRefusals.channel;
	const summary = trimmedText(input.summary);
	if (summary === '' || summary.length > longestSummary) return leadConversationRefusals.summary;
	const whatWasSaid = trimmedText(input.whatWasSaid);
	if (whatWasSaid.length > longestWhatWasSaid) return leadConversationRefusals.whatWasSaid;
	return { clientId, personId, heldByAccountId, heldOn, channel, summary, whatWasSaid };
}
