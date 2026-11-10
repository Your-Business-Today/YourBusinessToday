import type { BusinessBrainPartKind } from './businessBrainRules';

/** The limits on a chatbot of Your Business Brain, stated once and mirrored by migration 0161. */
export const businessBrainChatbotLimits = {
	longestName: 120,
	shortestEmail: 3,
	longestEmail: 320,
	mostPeopleAtOnce: 50
} as const;

/** A chatbot as a manager makes it: its name, the parts of the brain it may read and the people who may use it. */
export type BusinessBrainChatbotGiven = { name: string; parts: BusinessBrainPartKind[]; people: string[] };

/** What a manager changes on a chatbot: parts and people to add and to take away. */
export type BusinessBrainChatbotChange = {
	chatbotId: string;
	addParts: BusinessBrainPartKind[];
	removeParts: BusinessBrainPartKind[];
	addPeople: string[];
	removePeople: string[];
};

/** A chatbot as it stands: the parts it reads now and the people who may use it now. */
export type BusinessBrainChatbot = {
	chatbotId: string;
	name: string;
	madeAt: string;
	parts: BusinessBrainPartKind[];
	people: string[];
};
