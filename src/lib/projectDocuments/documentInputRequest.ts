/** Someone asked for their input on a document: who asked, who is asked, the question and, once given, the answer. */
export type DocumentInputRequest = {
	id: string;
	documentId: string;
	askedOf: string;
	askedBy: string | null;
	question: string;
	answer: string | null;
	answeredAt: string | null;
	createdAt: string;
};

/** An input request as a page shows it: with the names of who asked and who was asked. */
export type ShownInputRequest = DocumentInputRequest & { askedByName: string; askedOfName: string };
