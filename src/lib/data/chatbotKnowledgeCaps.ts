/**
 * How much of each brain a chatbot is shown at every question, so the prompt
 * stays bounded however large the knowledge base grows.
 */
export const chatbotKnowledgeCaps = {
	longestExpertiseIndex: 20_000,
	mostExperienceItems: 40,
	longestExperienceEntry: 280,
	longestExperienceSection: 10_000,
	mostProcessMaps: 3,
	mostTasksPerRole: 15,
	longestTaskSummary: 160,
	longestProcessSection: 12_000
} as const;
