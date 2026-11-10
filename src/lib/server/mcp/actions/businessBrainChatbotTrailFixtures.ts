/** What the tests of the chatbot's record keep in place of its three tables. */
export type TrailStandIn = { questions: { questionId: string; askedBy: string; question: string }[] };

/** Stand-ins for the record's writers, keeping each row in the trail given. */
export function trailWriters(trail: TrailStandIn) {
	return {
		openChatbotQuestion: async (_supabase: unknown, _place: unknown, asker: { accountId: string }, question: string) => {
			const { questions } = trail;
			const questionId = `00000000-0000-0000-0000-00000000010${questions.length}`;
			questions.push({ questionId, askedBy: asker.accountId, question });
			return questionId;
		},
		isQuestionOfAsker: async (_supabase: unknown, _place: unknown, asker: { accountId: string }, questionId: string) =>
			trail.questions.some((question) => question.questionId === questionId && question.askedBy === asker.accountId),
		readChatbotPlace: async (_supabase: unknown, chatbotId: string) => ({ organisationId: 'jewel', chatbotId })
	};
}
