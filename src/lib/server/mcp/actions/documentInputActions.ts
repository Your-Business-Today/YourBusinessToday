import { answerDocumentInput, askForDocumentInput } from '$lib/server/projectDocuments/documentInputRequests';
import { checkAnswer, checkAskedOf, checkQuestion } from '$lib/projectDocuments/validateInputRequest';
import { documentsPageAddress } from './documentHomes';
import { findPersonOnOwner, noReachableDocument, reachableDocument } from './documentPeople';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type Input = Record<string, unknown>;

const askSchema = objectSchema(
	{
		documentId: textField('The document id, as list_organisation_documents or list_project_documents gives it'),
		askedOf: textField('Who you want input from: their account id, email or name, as read_organisation or list_project_people gives it'),
		question: textField('What you want their input on, in their words if they gave them')
	},
	['documentId', 'askedOf', 'question']
);

const answerSchema = objectSchema(
	{ requestId: textField('The request id, as list_waiting_on_me or the document gives it'), answer: textField('Their input, in their words') },
	['requestId', 'answer']
);

async function askForInput(caller: McpCaller, input: Input): Promise<string> {
	const question = checkQuestion(input.question);
	if ('refusal' in question) return `Not asked: ${question.refusal}.`;
	const askedOf = checkAskedOf(input.askedOf);
	if ('refusal' in askedOf) return `Not asked: ${askedOf.refusal}.`;
	const found = await reachableDocument(caller, readText(input, 'documentId'));
	if (found === null) return noReachableDocument;
	const { document, reached } = found;
	const person = await findPersonOnOwner(caller, document.owner, askedOf.value);
	if (person === null) return `Not asked: nobody on ${reached.name} is called ${askedOf.value}.`;
	const asked = { documentId: document.id, askedOf: person.id, askedBy: caller.accountId, question: question.value };
	const requestId = await askForDocumentInput(caller.supabase, asked);
	return `Asked ${person.name} for their input on "${document.title}" (request id ${requestId}). It waits on them in list_waiting_on_me until they answer. The document is at ${documentsPageAddress(document.owner)}.`;
}

async function answerInput(caller: McpCaller, input: Input): Promise<string> {
	const answer = checkAnswer(input.answer);
	if ('refusal' in answer) return `Not answered: ${answer.refusal}.`;
	const isAnswered = await answerDocumentInput(caller.supabase, readText(input, 'requestId'), caller.accountId, answer.value);
	if (!isAnswered) return 'No input waiting on you has that request id. Call list_waiting_on_me for the ones that are.';
	return 'Your input is kept on the document, for whoever asked and everyone working on it.';
}

/** The connector actions that ask someone on a document's owner for their input, and give it. */
export const documentInputActions: McpAction[] = [
	{
		name: 'ask_for_document_input',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary: 'ask someone on the organisation or product for their input on one of its documents; it waits on them until they answer',
		guidance: 'Ask only on the person’s word, naming who and what. Nothing is emailed: their Claude brings it to them through list_waiting_on_me.',
		inputSchema: askSchema,
		run: askForInput
	},
	{
		name: 'answer_document_input',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary: 'give the input someone asked of you on a document',
		guidance: 'Record the person’s own words, once they have given them.',
		inputSchema: answerSchema,
		run: answerInput
	}
];
