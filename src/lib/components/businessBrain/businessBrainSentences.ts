const onePerson = 1;

/** How many people use a chatbot, as a sentence fragment. */
export function peopleCountSentence(peopleCount: number): string {
	if (peopleCount === onePerson) return 'Used by 1 person';
	return `Used by ${peopleCount} people`;
}

/** How many files are listed of how many there are, when not all of them are. */
export function filesListedSentence(listedCount: number, fileCount: number): string {
	return `The latest ${listedCount} of ${fileCount} files.`;
}

/** How many questions are listed of how many match, when not all of them are. */
export function questionsListedSentence(listedCount: number, questionCount: number): string {
	return `The newest ${listedCount} of ${questionCount} questions. Narrow by person or days, or download the record for all of them.`;
}
