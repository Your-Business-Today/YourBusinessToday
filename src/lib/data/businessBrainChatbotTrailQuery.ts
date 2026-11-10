/** The filters a manager asked the questions-asked page for, as the address carries them; a blank one is not asked for. */
export type AskedChatbotTrail = { person: string; fromDay: string; toDay: string };

/** The address's names for the filters, the same names the connector's list_business_brain_chatbot_questions takes. */
export const chatbotTrailFieldNames = { person: 'person', fromDay: 'fromDay', toDay: 'toDay' } as const;

export function askedChatbotTrailOf(query: URLSearchParams): AskedChatbotTrail {
	return {
		person: askedValue(query, chatbotTrailFieldNames.person),
		fromDay: askedValue(query, chatbotTrailFieldNames.fromDay),
		toDay: askedValue(query, chatbotTrailFieldNames.toDay)
	};
}

/** Whether the manager narrowed the record at all. */
export function isChatbotTrailNarrowed(asked: AskedChatbotTrail): boolean {
	return Object.values(asked).some((value) => value !== '');
}

function askedValue(query: URLSearchParams, fieldName: string): string {
	return query.get(fieldName)?.trim() ?? '';
}
