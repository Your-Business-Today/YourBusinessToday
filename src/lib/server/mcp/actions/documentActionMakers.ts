import { addDocumentRun, deleteDocumentRun, recordDocumentRun } from './documentWriteRuns';
import { DocumentLimits, documentUploadLinkLifetimeHours } from '$lib/projectDocuments/documentLimits';
import { documentActionSchemas } from './projectDocumentSchemas';
import { listDocumentsRun, readDocumentRun } from './projectDocumentRuns';
import { updateDocumentRun } from './documentUpdateRun';
import type { DocumentHome } from './documentHomes';
import type { McpAction } from '../actionTypes';

const everyone = 'everyone';
const { largestMegabytes } = DocumentLimits;

const readingOn = (home: DocumentHome) => ({ area: home.area, audience: everyone, isWrite: false }) as const;
const writingOn = (home: DocumentHome) => ({ area: home.area, audience: everyone, isWrite: true }) as const;

function writingTheDocument(home: DocumentHome): string {
	const { names } = home;
	return (
		'Write the document in your own workspace, never on a service of ours. A document people read on the site, such as a specification, ' +
		'a policy, a guide to how something works or a list of what is asked of them, is best sent as markdown, its text, and is kept at once. ' +
		`A file made elsewhere, a PDF, a Word document, a spreadsheet or a picture under ${largestMegabytes} MB, is described by filename, ` +
		`mimeType and byteCount instead: the answer gives a link for one HTTP PUT of the file, open for ${documentUploadLinkLifetimeHours} hours, ` +
		`then call ${names.record}. Say whether it is an output, what was made, or an input, material that came in.`
	);
}

/** The action that lists a home's documents, outputs then inputs, section by section. */
export function listDocumentsAction(name: string, home: DocumentHome): McpAction {
	const summary = `the ${home.noun}’s documents, outputs then inputs, section by section, each with its status and version`;
	return { ...readingOn(home), name, summary, inputSchema: documentActionSchemas(home).list, run: listDocumentsRun(home) };
}

/** The action that reads one document at the version it holds now or an earlier one. */
export function readDocumentAction(name: string, home: DocumentHome): McpAction {
	return {
		...readingOn(home),
		name,
		summary: `one of the ${home.noun}’s documents at the version it holds now or an earlier one: a written one in full, a file with a link to fetch it, with its versions and the input asked on it`,
		guidance: 'A file’s link lasts a few minutes, for you to read it now; do not pass it on. To give a person a document, give them the Documents page.',
		inputSchema: documentActionSchemas(home).read,
		run: readDocumentRun(home)
	};
}

/** The action that puts a document on a home, as its text or as a file sent to a link. */
export function addDocumentAction(name: string, home: DocumentHome): McpAction {
	return {
		...writingOn(home),
		name,
		summary: `put a document on the ${home.noun}: send its text in Markdown, or describe a file and send it to the link given`,
		guidance: `${writingTheDocument(home)} Each value is checked against its column, and one that does not fit is refused by name. Only the people on the ${home.noun} see it.`,
		inputSchema: documentActionSchemas(home).add,
		run: addDocumentRun(home)
	};
}

/** The action that records a file's arrival at its link, so it is kept. */
export function recordDocumentAction(name: string, home: DocumentHome): McpAction {
	const { names } = home;
	const summary = `record that a file sent to a link from ${names.add} or ${names.update} arrived, so it is kept`;
	return { ...writingOn(home), name, summary, guidance: 'Call this once the PUT has succeeded.', inputSchema: documentActionSchemas(home).record, run: recordDocumentRun(home) };
}

/** The action that changes a document's details or keeps new text or a new file as its next version. */
export function updateDocumentAction(name: string, home: DocumentHome): McpAction {
	return {
		...writingOn(home),
		name,
		summary: 'change a document’s title, summary, section, position, status or whether it is an input or an output, or keep new text or a new file as its next version',
		guidance:
			'Name only what changes. New text or a new file is the document’s next version and every earlier version is kept, so the team can work on a draft together. ' +
			'A new file gives a link to send it to, then the record action.',
		inputSchema: documentActionSchemas(home).update,
		run: updateDocumentRun(home)
	};
}

/** The action that takes a document and every version of it off a home for good. */
export function deleteDocumentAction(name: string, home: DocumentHome): McpAction {
	return {
		...writingOn(home),
		name,
		summary: `take a document, every version of it and its files off the ${home.noun}, for good`,
		guidance: 'Only on the person’s word, after naming the document to them: it cannot be brought back.',
		inputSchema: documentActionSchemas(home).remove,
		run: deleteDocumentRun(home)
	};
}
