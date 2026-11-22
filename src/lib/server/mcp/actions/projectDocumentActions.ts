import { addProjectDocument, deleteProjectDocument, recordProjectDocument, updateProjectDocument } from './projectDocumentWriteRuns';
import { addProjectDocumentAction, listProjectDocumentsAction, recordProjectDocumentAction } from './describeProjectDocuments';
import { DocumentLimits, documentUploadLinkLifetimeHours } from '$lib/projectDocuments/documentLimits';
import { listProjectDocuments, readProjectDocument } from './projectDocumentRuns';
import {
	addProjectDocumentSchema,
	listProjectDocumentsSchema,
	oneProjectDocumentSchema,
	recordProjectDocumentSchema,
	updateProjectDocumentSchema
} from './projectDocumentSchemas';
import type { McpAction } from '../actionTypes';

const projectsArea = 'projects';
const everyone = 'everyone';
const { largestMegabytes } = DocumentLimits;

const writingTheDocument =
	'Write the document in your own workspace, never on a service of ours. A document people read on the site, such as a specification, ' +
	'a guide to how something works or a list of what is asked of them, is best sent as markdown, its text, and is kept at once. ' +
	`A file made elsewhere, a PDF, a Word document, a spreadsheet or a picture under ${largestMegabytes} MB, is described by filename, ` +
	`mimeType and byteCount instead: the answer gives a link for one HTTP PUT of the file, open for ${documentUploadLinkLifetimeHours} hours, ` +
	`then call ${recordProjectDocumentAction}.`;

/** The connector actions on a project's documents: list and read them, add a written document or a file, change and remove one. */
export const projectDocumentActions: McpAction[] = [
	{
		name: listProjectDocumentsAction,
		area: projectsArea,
		audience: everyone,
		isWrite: false,
		summary: 'the project’s documents, section by section, in the order they are listed',
		inputSchema: listProjectDocumentsSchema,
		run: listProjectDocuments
	},
	{
		name: 'read_project_document',
		area: projectsArea,
		audience: everyone,
		isWrite: false,
		summary: 'one of the project’s documents: a written one in full, a file with a link to fetch it',
		guidance: 'A file’s link lasts a few minutes, for you to read it now; do not pass it on. To give a person a document, give them the Documents page.',
		inputSchema: oneProjectDocumentSchema,
		run: readProjectDocument
	},
	{
		name: addProjectDocumentAction,
		area: projectsArea,
		audience: everyone,
		isWrite: true,
		summary: 'put a document on the project: send its text in Markdown, or describe a file and send it to the link given',
		guidance: `${writingTheDocument} Each value is checked against its column, and one that does not fit is refused by name. Only the people on the project see it.`,
		inputSchema: addProjectDocumentSchema,
		run: addProjectDocument
	},
	{
		name: recordProjectDocumentAction,
		area: projectsArea,
		audience: everyone,
		isWrite: true,
		summary: 'record that a file sent to a link from add_project_document arrived, so the document shows on the project',
		guidance: 'Call this once the PUT has succeeded.',
		inputSchema: recordProjectDocumentSchema,
		run: recordProjectDocument
	},
	{
		name: 'update_project_document',
		area: projectsArea,
		audience: everyone,
		isWrite: true,
		summary: 'change a document’s title, summary, section or position, or put new text in place of a written document’s text',
		guidance: 'Name only what changes. To replace a file, add the document again and delete the old one.',
		inputSchema: updateProjectDocumentSchema,
		run: updateProjectDocument
	},
	{
		name: 'delete_project_document',
		area: projectsArea,
		audience: everyone,
		isWrite: true,
		summary: 'take a document and its file off the project, for good',
		guidance: 'Only on the person’s word, after naming the document to them: it cannot be brought back.',
		inputSchema: oneProjectDocumentSchema,
		run: deleteProjectDocument
	}
];
