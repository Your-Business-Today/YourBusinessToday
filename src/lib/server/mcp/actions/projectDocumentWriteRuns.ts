import { changeDocumentDetails, removeProjectDocument, rewriteDocument } from '$lib/server/projectDocuments/changeProjectDocument';
import { describeDocumentRecording, describeDocumentUpload } from './describeDocumentUpload';
import { documentsPageAddress, noSuchDocument } from './describeProjectDocuments';
import { findKeptDocument } from '$lib/server/projectDocuments/findProjectDocuments';
import { grantDocumentUpload, keepWrittenDocument } from '$lib/server/projectDocuments/keepProjectDocument';
import { noReachableProject, reachableProject } from '../projectAccess';
import { readText } from '../actionTypes';
import { recordDocumentUpload } from '$lib/server/projectDocuments/recordDocumentUpload';
import { validateDocumentChanges } from '$lib/projectDocuments/validateDocumentChanges';
import { validateDocumentGiven } from '$lib/projectDocuments/validateDocumentGiven';
import type { McpCaller } from '../resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';
import type { DocumentGiven } from '$lib/projectDocuments/projectDocument';

type Input = Record<string, unknown>;

/** Keeps a written document on the project at once, or keeps a file's document waiting for its file and gives the link to send it to. */
export async function addProjectDocument(caller: McpCaller, input: Input): Promise<string> {
	const document = validateDocumentGiven(input);
	if (typeof document === 'string') return `Not added: ${document}. Nothing was kept.`;
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	return keepGivenDocument(caller, project, document);
}

async function keepGivenDocument(caller: McpCaller, project: Project, document: DocumentGiven): Promise<string> {
	const adder = { projectId: project.id, accountId: caller.accountId };
	const { details, content } = document;
	if ('file' in content) {
		const grant = await grantDocumentUpload(caller.supabase, adder, details, content.file);
		return describeDocumentUpload(project, details.title, content.file, grant);
	}
	const documentId = await keepWrittenDocument(caller.supabase, adder, details, content.markdown);
	return `"${details.title}" is on ${project.name}'s documents (document id ${documentId}). Read it at ${documentsPageAddress(project)}.`;
}

/** Records that the file sent to a granted link arrived, so the document shows on the project. */
export async function recordProjectDocument(caller: McpCaller, input: Input): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const documentId = readText(input, 'documentId');
	const recording = await recordDocumentUpload(caller.supabase, { projectId: project.id, accountId: caller.accountId }, documentId);
	return describeDocumentRecording(project, documentId, recording);
}

/** Changes the words or the place of a document on the project, and the text of a written one. */
export async function updateProjectDocument(caller: McpCaller, input: Input): Promise<string> {
	const changes = validateDocumentChanges(input);
	if (typeof changes === 'string') return `Not changed: ${changes}. Nothing was changed.`;
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const document = await findKeptDocument(caller.supabase, project.id, readText(input, 'documentId'));
	if (document === null) return noSuchDocument;
	const { details, markdown, named } = changes;
	const isRewritingFile = markdown !== null && !document.isWritten;
	if (isRewritingFile) return 'Not changed: only a written document takes new markdown; to replace a file, add the document again and delete the old one.';
	await changeDocumentDetails(caller.supabase, document, details);
	if (markdown !== null) await rewriteDocument(caller.supabase, document, markdown);
	return `"${details.title ?? document.title}" is changed: ${named.join(', ')}. It shows at ${documentsPageAddress(project)}.`;
}

/** Takes a document and its file off the project. */
export async function deleteProjectDocument(caller: McpCaller, input: Input): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const document = await findKeptDocument(caller.supabase, project.id, readText(input, 'documentId'));
	if (document === null) return noSuchDocument;
	await removeProjectDocument(caller.supabase, document);
	return `"${document.title}" is off ${project.name}'s documents.`;
}
