import { DocumentLimits, documentFileTypes } from '$lib/projectDocuments/documentLimits';
import { objectSchema, textField } from '../actionTypes';

const { longestTitle, longestSummary, longestSection, longestFilename, longestMarkdown, largestByteCount, highestPosition } = DocumentLimits;

const projectIdField = textField('The project id, as list_projects gives it');
const documentIdField = textField('The document id, as list_project_documents gives it');

const detailFields = {
	title: textField(`What the document is called, at most ${longestTitle} characters`),
	summary: textField(`What the document is about, in a sentence or two, at most ${longestSummary} characters`),
	section: textField(`The section it sits in, such as Product, Asks or How it works, at most ${longestSection} characters; General when left out`),
	position: { type: 'integer', description: `Where it is listed in its section, lowest first, from 0 up to ${highestPosition}; 0 when left out` }
};

const markdownField = textField(`The document's text, written in Markdown, at most ${longestMarkdown} characters`);

const fileFields = {
	filename: textField(`What the file is called, such as specification.pdf, at most ${longestFilename} characters`),
	mimeType: { type: 'string', enum: documentFileTypes, description: 'The file’s type' },
	byteCount: { type: 'integer', description: `The file’s size in bytes, from 1 up to ${largestByteCount}` }
};

export const listProjectDocumentsSchema = objectSchema({ projectId: projectIdField }, ['projectId']);

export const oneProjectDocumentSchema = objectSchema({ projectId: projectIdField, documentId: documentIdField }, ['projectId', 'documentId']);

export const addProjectDocumentSchema = objectSchema({ projectId: projectIdField, ...detailFields, markdown: markdownField, ...fileFields }, [
	'projectId',
	'title'
]);

export const recordProjectDocumentSchema = objectSchema(
	{ projectId: projectIdField, documentId: textField('The documentId add_project_document gave') },
	['projectId', 'documentId']
);

export const updateProjectDocumentSchema = objectSchema(
	{ projectId: projectIdField, documentId: documentIdField, ...detailFields, markdown: textField(`New text for a written document, in place of its old text, at most ${longestMarkdown} characters`) },
	['projectId', 'documentId']
);
