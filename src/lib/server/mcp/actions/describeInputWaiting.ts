import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { documentsPageAddress } from './documentHomes';
import { readInputWaitingOn } from '$lib/server/projectDocuments/documentInputRequests';
import { reachableDocument } from './documentPeople';
import type { DocumentInputRequest } from '$lib/projectDocuments/documentInputRequest';
import type { McpCaller } from '../resolveMcpCaller';

const heading = '## Input asked of you on documents';
const someoneGone = 'Someone no longer here';

/** The input still asked of the caller on documents they reach, each with who asked, the question and how to answer it. */
export async function describeInputWaiting(caller: McpCaller): Promise<string[]> {
	const requests = await readInputWaitingOn(caller.supabase, caller.accountId);
	if (requests.length === 0) return [];
	const askers = await getAccountsById(caller.supabase, requests.map((request) => request.askedBy ?? request.askedOf));
	const lines = await Promise.all(requests.map((request) => describeWaitingLine(caller, request, askers)));
	return [heading, ...lines.filter((line): line is string => line !== null), ''];
}

async function describeWaitingLine(caller: McpCaller, request: DocumentInputRequest, askers: { id: string; name: string }[]): Promise<string | null> {
	const found = await reachableDocument(caller, request.documentId);
	if (found === null) return null;
	const askerName = askers.find((asker) => asker.id === request.askedBy)?.name ?? someoneGone;
	const { document, reached } = found;
	const place = `"${document.title}" on ${reached.name} (${documentsPageAddress(document.owner)})`;
	return `- ${askerName} asked on ${request.createdAt} for your input on ${place}: "${request.question}" — answer with answer_document_input, request id ${request.id}`;
}
