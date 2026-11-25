import type { SupabaseClient } from '@supabase/supabase-js';
import type { DocumentInputRequest } from '$lib/projectDocuments/documentInputRequest';

const inputRequestTable = 'project_document_input_requests';
const inputRequestColumns = 'id, document_id, asked_of, asked_by, question, answer, answered_at, created_at';

/** What a new input request asks, of whom, on which document and by whom. */
export type InputAsked = { documentId: string; askedOf: string; askedBy: string; question: string };

/** Asks someone for their input on a document, and gives the request's id. */
export async function askForDocumentInput(supabase: SupabaseClient, asked: InputAsked): Promise<string> {
	const row = { document_id: asked.documentId, asked_of: asked.askedOf, asked_by: asked.askedBy, question: asked.question };
	const { data, error } = await supabase.from(inputRequestTable).insert(row).select('id').single();
	if (error !== null) throw error;
	return data.id as string;
}

/** Keeps the input given by the person it was asked of; false when no unanswered request of theirs has that id. */
export async function answerDocumentInput(supabase: SupabaseClient, requestId: string, accountId: string, answer: string): Promise<boolean> {
	const { data, error } = await supabase
		.from(inputRequestTable)
		.update({ answer, answered_at: new Date().toISOString() })
		.eq('id', requestId)
		.eq('asked_of', accountId)
		.is('answered_at', null)
		.select('id');
	if (error !== null) throw error;
	return data.length > 0;
}

/** Every input asked on the document, the oldest first. */
export async function readInputRequestsOn(supabase: SupabaseClient, documentId: string): Promise<DocumentInputRequest[]> {
	const { data, error } = await supabase.from(inputRequestTable).select(inputRequestColumns).eq('document_id', documentId).order('created_at');
	if (error !== null) throw error;
	return (data ?? []).map(parseInputRequest);
}

/** The input still asked of this person, on any document, the oldest first. */
export async function readInputWaitingOn(supabase: SupabaseClient, accountId: string): Promise<DocumentInputRequest[]> {
	const { data, error } = await supabase.from(inputRequestTable).select(inputRequestColumns).eq('asked_of', accountId).is('answered_at', null).order('created_at');
	if (error !== null) throw error;
	return (data ?? []).map(parseInputRequest);
}

function parseInputRequest(row: Record<string, unknown>): DocumentInputRequest {
	return {
		id: row.id as string,
		documentId: row.document_id as string,
		askedOf: row.asked_of as string,
		askedBy: (row.asked_by as string | null) ?? null,
		question: row.question as string,
		answer: (row.answer as string | null) ?? null,
		answeredAt: (row.answered_at as string | null) ?? null,
		createdAt: row.created_at as string
	};
}
