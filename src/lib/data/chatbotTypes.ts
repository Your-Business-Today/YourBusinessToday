export type ChatbotSummary = {
	id: string;
	knowledgeBaseId: string;
	ownerId: string;
	name: string;
	poolCredits: number;
	isPaused: boolean;
	modelId: string;
	memberCount: number;
	openQuestionCount: number;
	createdAt: string;
};

export type ChatbotMember = {
	id: string;
	invitedEmail: string;
	hasJoined: boolean;
	modelId: string | null;
	allowanceCredits: number;
	spentCredits: number;
	joinedAt: string | null;
};

export type ChatbotTopUp = {
	id: string;
	credits: number;
	createdAt: string;
};

export type ChatbotMembership = {
	allowanceCredits: number;
	spentCredits: number;
	/** The member's override, or the bot's own model when there is none. */
	modelId: string;
};

export type ChatbotSpeaker = 'member' | 'bot';

export type ChatbotMessage = {
	id: string;
	speaker: ChatbotSpeaker;
	body: string;
	citedPageKeys: string[];
	createdAt: string;
};

export type ChatbotAnswer = {
	answerMarkdown: string;
	citedPageKeys: string[];
	/** What the knowledge base would need to answer this, or null when it did. */
	missingKnowledge: string | null;
};

export const longestTeachingAnswer = 4000;

export type KnowledgeGapStatus = 'open' | 'answered' | 'dismissed';

export type KnowledgeGap = {
	id: string;
	question: string;
	missingKnowledge: string;
	status: KnowledgeGapStatus;
	askedByEmail: string | null;
	timesAsked: number;
	lastAskedAt: string;
	answer: string | null;
	resolvedAt: string | null;
};

export type MemberAllowance = { memberId: string; allowance: number };

export const defaultMemberAllowanceCredits = 100;

export type MemberChatbot = {
	id: string;
	name: string;
	allowanceCredits: number;
	spentCredits: number;
	isPaused: boolean;
};
