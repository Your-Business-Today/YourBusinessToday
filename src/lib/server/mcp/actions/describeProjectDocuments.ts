import { companyDetails } from '$lib/data/companyDetails';
import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { documentSectionsOf, type DocumentSection } from '$lib/projectDocuments/documentSections';
import { projectHref, projectSegments } from '$lib/components/projects/projectAddresses';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

export const addProjectDocumentAction = 'add_project_document';
export const recordProjectDocumentAction = 'record_project_document';
export const listProjectDocumentsAction = 'list_project_documents';

export const noSuchDocument = `No document on this project has that id. Call ${listProjectDocumentsAction} for the ones it holds.`;

/** Where a person reads the project's documents on the site. */
export function documentsPageAddress(project: Project): string {
	return `${companyDetails.websiteUrl}${projectHref(project.id, projectSegments.documents)}`;
}

/** The project's documents section by section, each with its place, its size and its id. */
export function describeProjectDocuments(project: Project, documents: ProjectDocument[]): string {
	const address = documentsPageAddress(project);
	if (documents.length === 0) return `${project.name} has no documents yet. Add one with ${addProjectDocumentAction}; they show at ${address}.`;
	const sections = documentSectionsOf(documents).map(describeSection);
	return [`# ${project.name}'s documents, as ${address} shows them:`, ...sections].join('\n\n');
}

function describeSection(section: DocumentSection<ProjectDocument>): string {
	const lines = section.documents.map((document) => `- ${describeDocumentLine(document)}`);
	return [`## ${section.name}`, ...lines].join('\n');
}

function describeDocumentLine(document: ProjectDocument): string {
	const kind = document.isWritten ? 'written in Markdown' : document.mimeType;
	return `${document.title} (position ${document.position}, ${kind}, ${describeByteCount(document.byteCount)}, document id: ${document.id})`;
}

/** The heading of one document in full: what it is called, where it sits and what it is about. */
export function describeDocumentHeading(document: ProjectDocument): string {
	const summary = document.summary === '' ? 'No summary yet.' : document.summary;
	return [`# ${document.title}`, `In ${document.section}, position ${document.position}. ${summary}`].join('\n');
}

/** A written document in full, with its text. */
export function describeWrittenDocument(document: ProjectDocument, markdown: string): string {
	return [describeDocumentHeading(document), '', markdown].join('\n');
}

/** A document kept as a file, with a short-lived link to fetch it. */
export function describeDocumentFile(document: ProjectDocument, fetchLink: string, linkMinutes: number): string {
	return [
		describeDocumentHeading(document),
		`File: ${document.filename}, ${document.mimeType}, ${describeByteCount(document.byteCount)}.`,
		`Fetch it within ${linkMinutes} minutes, to read it now; do not pass the link on: ${fetchLink}`
	].join('\n');
}
