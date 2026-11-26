import { documentsPageAddress, productDocumentHome } from './documentHomes';
import { fileAttachmentAsDocument, type AttachmentFiling, type FilingPlace } from '$lib/server/projectDocuments/fileAttachmentAsDocument';
import { getTaskAttachments } from '$lib/server/projects/getTaskAttachments';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableTask } from '../projectAccess';
import type { McpAction } from '../actionTypes';

const fileTaskAttachmentsName = 'file_task_attachments_as_project_documents';

function describeFiling(filing: AttachmentFiling): string {
	if ('refusal' in filing) return `- "${filing.filename}" not filed: ${filing.refusal}`;
	return `- "${filing.filename}" kept (document id ${filing.documentId})`;
}

export const attachmentFilingActions: McpAction[] = [
	{
		name: fileTaskAttachmentsName,
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'keep a copy of every file on a task in its project’s documents, each under its own name',
		guidance:
			'Use it when finished work was put on a task as files — research, a report, briefs — so it is kept where the ' +
			'project keeps its documents. Each file becomes one document titled with its file name, in the section given. ' +
			'The files stay on the task too, so nothing is lost. Then the task can be closed with update_task_status.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task whose files are kept as documents'),
				section: textField('The section of the project’s documents they sit in, at most 80 characters; General when left out'),
				summary: textField('What the documents are, in a sentence or two, given to each of them'),
				status: textField('draft, in_review or approved; draft when left out'),
				flow: textField('output for what was made, input for material that came in; output when left out')
			},
			['taskId']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const reached = await productDocumentHome.reach(caller, task.projectId);
			if (reached === null) return productDocumentHome.unreachable;
			const adder = { owner: reached.owner, accountId: caller.accountId };
			const attachments = await getTaskAttachments(caller.supabase, task.id);
			if (attachments.length === 0) return `"${task.title}" has no files to keep.`;
			const place = { section: input.section, summary: input.summary, status: input.status, flow: input.flow } as FilingPlace;
			const filings: AttachmentFiling[] = [];
			for (const attachment of attachments) filings.push(await fileAttachmentAsDocument(caller.supabase, adder, attachment, place));
			const heading = `The files on "${task.title}" are on ${reached.name}'s documents at ${documentsPageAddress(reached.owner)}:`;
			return [heading, ...filings.map(describeFiling)].join('\n');
		}
	}
];
