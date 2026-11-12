/** How a conversation with a lead's people was had. */
export type ConversationChannel = 'call' | 'video_call' | 'meeting' | 'message' | 'email';

export const conversationChannelLabels: Record<ConversationChannel, string> = {
	call: 'Phone call',
	video_call: 'Video call',
	meeting: 'Meeting',
	message: 'Messages',
	email: 'Email'
};

export const conversationChannels = Object.keys(conversationChannelLabels) as ConversationChannel[];

/** The limits on a logged conversation, stated once and mirrored by migration 0208. */
export const leadConversationLimits = {
	longestSummary: 300,
	longestWhatWasSaid: 20000
} as const;

/** A conversation as staff log it, checked by validateLeadConversation before anything is written. */
export type LeadConversationLogged = {
	clientId: string;
	personId: string | null;
	heldByAccountId: string;
	heldOn: string;
	channel: ConversationChannel;
	summary: string;
	whatWasSaid: string;
};

/** A conversation kept on a lead, with the names of who had it on each side. */
export type LeadConversation = Omit<LeadConversationLogged, 'clientId' | 'heldByAccountId'> & {
	id: string;
	personName: string;
	heldByName: string;
	loggedAt: string;
};

export function isConversationChannel(candidate: string): candidate is ConversationChannel {
	return conversationChannels.some((channel) => channel === candidate);
}
