import { DocumentLimits, documentFileTypes } from '$lib/projectDocuments/documentLimits';
import { documentFlows, documentStatuses } from '$lib/projectDocuments/documentStanding';
import { objectSchema, textField } from '../actionTypes';
import { type DocumentHome } from './documentHomes';

const { longestTitle, longestSummary, longestSection, longestFilename, longestMarkdown, largestByteCount, highestPosition, highestVersion } = DocumentLimits;

const detailFields = {
	title: textField(`What the document is called, at most ${longestTitle} characters`),
	summary: textField(`What the document is about, in a sentence or two, at most ${longestSummary} characters`),
	section: textField(`The section it sits in, such as Policies, Asks or How it works, at most ${longestSection} characters; General when left out`),
	position: { type: 'integer', description: `Where it is listed in its section, lowest first, from 0 up to ${highestPosition}; 0 when left out` },
	status: { type: 'string', enum: documentStatuses, description: 'Where it stands: a draft the team works on, in review, or approved; draft when left out' },
	flow: { type: 'string', enum: documentFlows, description: 'output for what was made, the valuable part; input for material that came in, such as a client pack or a source file; output when left out' }
};

const fileFields = {
	filename: textField(`What the file is called, such as specification.pdf, at most ${longestFilename} characters`),
	mimeType: { type: 'string', enum: documentFileTypes, description: 'The file’s type' },
	byteCount: { type: 'integer', description: `The file’s size in bytes, from 1 up to ${largestByteCount}` }
};

/** The input of each of a home's document actions. */
export function documentActionSchemas(home: DocumentHome) {
	const { names } = home;
	const ownerField = { [home.idField]: textField(home.idDescription) };
	const documentIdField = { documentId: textField(`The document id, as ${names.list} gives it`) };
	const ownedDocument = { ...ownerField, ...documentIdField };
	const required = [home.idField, 'documentId'];
	const versionField = { versionNumber: { type: 'integer', description: `An earlier version to read, from 1 up to ${highestVersion}; the version it holds now when left out` } };
	const markdown = textField(`The document's text, written in Markdown, at most ${longestMarkdown} characters`);
	const newMarkdown = textField(`New text for the document, kept as its next version; the text before stays as the version it was. At most ${longestMarkdown} characters`);
	return {
		list: objectSchema(ownerField, [home.idField]),
		read: objectSchema({ ...ownedDocument, ...versionField }, required),
		add: objectSchema({ ...ownerField, ...detailFields, markdown, ...fileFields }, [home.idField, 'title']),
		record: objectSchema({ ...ownerField, documentId: textField(`The documentId ${names.add} or ${names.update} gave`) }, required),
		update: objectSchema({ ...ownedDocument, ...detailFields, markdown: newMarkdown, ...fileFields }, required),
		remove: objectSchema(ownedDocument, required)
	};
}
