import type { BusinessBrainPartKind } from './businessBrainRules';

/** The limits on a chatbot of Your Business Brain, stated once and mirrored by migrations 0161 and 0200. */
export const businessBrainChatbotLimits = {
	longestName: 120,
	longestPurpose: 1000,
	shortestEmail: 3,
	longestEmail: 320,
	mostPeopleAtOnce: 50
} as const;

/** A chatbot as a manager makes it: its name, what it is for, the parts of the brain it may read and the people who may use it. */
export type BusinessBrainChatbotGiven = { name: string; purpose: string; parts: BusinessBrainPartKind[]; people: string[] };

/** What a manager changes on a chatbot: its purpose (null leaves it), and parts and people to add and to take away. */
export type BusinessBrainChatbotChange = {
	chatbotId: string;
	purpose: string | null;
	addParts: BusinessBrainPartKind[];
	removeParts: BusinessBrainPartKind[];
	addPeople: string[];
	removePeople: string[];
};

/** A chatbot as it stands: the parts it reads now and the people who may use it now. */
export type BusinessBrainChatbot = {
	chatbotId: string;
	name: string;
	purpose: string;
	madeAt: string;
	parts: BusinessBrainPartKind[];
	people: string[];
};
