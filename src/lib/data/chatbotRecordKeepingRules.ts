/** How long a business keeps its chatbot record, in whole days, and how many deletions are listed: stated once and mirrored by migration 0292. */
export const chatbotRecordKeepingLimits = {
	shortestKeptDays: 1,
	longestKeptDays: 3650,
	mostDeletionsListed: 50
} as const;

/** Why a question left the record, as business_brain_chatbot_record_deletions.reason accepts it. */
export const chatbotRecordDeletionReasons = {
	deletedByTheBusiness: 'deleted_by_the_business',
	pastTheKeepingPeriod: 'past_the_keeping_period'
} as const;

export type ChatbotRecordDeletionReason = (typeof chatbotRecordDeletionReasons)[keyof typeof chatbotRecordDeletionReasons];

/** How long the record is kept: a number of days, or null for as long as the organisation's Your Business Brain is kept. */
export type ChatbotRecordKeeping = { keptDays: number | null; setAt: string | null };

/** The keeping a business has before it sets one: for as long as its Your Business Brain is kept. */
export const keptForTheBrainsLife: ChatbotRecordKeeping = { keptDays: null, setAt: null };

/** One question deleted from the record: when it was asked and deleted, and by whom or why, but never its words. */
export type ChatbotRecordDeletion = {
	questionId: string;
	chatbotId: string;
	questionAskedAt: string;
	deletedAt: string;
	deletedByEmail: string | null;
	reason: ChatbotRecordDeletionReason;
};

/** The field that carries the keeping period, on the site's form and the connector's action. */
export const keptDaysField = 'keptDays';
