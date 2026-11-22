import { describeDocumentFile, describeProjectDocuments, describeWrittenDocument, noSuchDocument } from './describeProjectDocuments';
import { fetchLinkLifetimeMinutes, signFetchLink } from '$lib/server/storage/signFetchLink';
import { findKeptDocument, readDocumentMarkdown, readKeptDocuments } from '$lib/server/projectDocuments/findProjectDocuments';
import { noReachableProject, reachableProject } from '../projectAccess';
import { projectDocumentBucket } from '$lib/server/projectDocuments/projectDocumentFiles';
import { readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

type Input = Record<string, unknown>;

/** The project's documents, section by section, in the order they are listed. */
export async function listProjectDocuments(caller: McpCaller, input: Input): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	return describeProjectDocuments(project, await readKeptDocuments(caller.supabase, project.id));
}

/** One of the project's documents in full: a written one with its text, a file with a short-lived link to fetch it. */
export async function readProjectDocument(caller: McpCaller, input: Input): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const document = await findKeptDocument(caller.supabase, project.id, readText(input, 'documentId'));
	if (document === null) return noSuchDocument;
	if (document.storagePath === null) return readWrittenDocument(caller, document);
	const fetchLink = await signFetchLink(caller.supabase, projectDocumentBucket, { storagePath: document.storagePath, filename: document.filename });
	return describeDocumentFile(document, fetchLink, fetchLinkLifetimeMinutes);
}

async function readWrittenDocument(caller: McpCaller, document: ProjectDocument): Promise<string> {
	const markdown = await readDocumentMarkdown(caller.supabase, document);
	return describeWrittenDocument(document, markdown);
}
