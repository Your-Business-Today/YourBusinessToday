import type { ChatbotQuestionRecord } from './readChatbotQuestionTrail';

export const laddersPageId = '00000000-0000-0000-0000-00000000000a';
export const scaffoldPageId = '00000000-0000-0000-0000-00000000000b';
export const madeUpPageId = '00000000-0000-0000-0000-00000000000c';

/** A question asked through the site team's chatbot: a search, a refused page reading and the answer Stuart's Claude reported. */
export const laddersQuestion: ChatbotQuestionRecord = {
	questionId: '00000000-0000-0000-0000-000000000101',
	chatbotId: '00000000-0000-0000-0000-000000000201',
	askedByEmail: 'stuart@example.com',
	question: 'Do ladders stay up overnight?',
	askedAt: '2026-11-10T09:15:00Z',
	readings: [
		{
			kind: 'search',
			question: 'Do ladders stay up overnight?',
			searchWords: 'ladders overnight',
			part: null,
			pageId: null,
			revisionId: null,
			outcome: 'given',
			refusal: null,
			pagesGiven: [
				{ pageId: laddersPageId, title: 'Ladders at the end of the day', filedAt: '2026-11-03T09:00:00Z', revisionId: null },
				{ pageId: scaffoldPageId, title: 'Scaffold handover', filedAt: '2026-10-01T09:00:00Z', revisionId: 4 }
			],
			readAt: '2026-11-10T09:15:02Z'
		},
		{
			kind: 'page',
			question: 'Do ladders stay up overnight?',
			searchWords: null,
			part: null,
			pageId: madeUpPageId,
			revisionId: null,
			outcome: 'refused',
			refusal: 'This chatbot does not read that page.',
			pagesGiven: [],
			readAt: '2026-11-10T09:15:05Z'
		}
	],
	answer: {
		answer: '=No. Ladders come down at the end of every day.',
		pagesCited: [laddersPageId, madeUpPageId],
		answeredByEmail: 'stuart@example.com',
		answeredAt: '2026-11-10T09:16:00Z'
	}
};

/** A question asked through the chatbot that nobody answered on the record. */
export const unansweredQuestion: ChatbotQuestionRecord = {
	...laddersQuestion,
	questionId: '00000000-0000-0000-0000-000000000102',
	question: 'Who holds the van keys?',
	readings: [],
	answer: null
};
