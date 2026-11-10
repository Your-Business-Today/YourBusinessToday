import { objectSchema, textField } from '../actionTypes';
import { boardPaperFileKinds, boardPaperLimits } from '$lib/data/boardroomPaperRules';
import { boardRecordSources } from '$lib/data/boardroomRecordPaper';
import { organisationIdField } from './organisationDetailsFields';

const { longestTitle, longestNote, longestFilename, largestByteCount } = boardPaperLimits;
const meetingIdField = textField('The meeting id, as list_board_meetings gives it');
const paperIdField = textField('The paper id, as read_board_meeting or add_board_paper gives it');
const itemNumberField = {
	type: 'integer',
	minimum: 1,
	description: 'The agenda item the paper goes on, by its number as read_board_meeting gives it now'
};
const titleField = textField(`What the paper is, such as "Management accounts to 31 October", at most ${longestTitle} characters`);

export const addPaperSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		itemNumber: itemNumberField,
		title: titleField,
		note: textField(`A written note, at most ${longestNote} characters; leave out when sending a file`),
		filename: textField(`For a file: what it is called, such as accounts-october-2026.pdf, at most ${longestFilename} characters`),
		mimeType: { type: 'string', enum: Object.keys(boardPaperFileKinds), description: 'For a file: its kind' },
		byteCount: { type: 'integer', minimum: 1, maximum: largestByteCount, description: 'For a file: its size in bytes' }
	},
	['organisationId', 'meetingId', 'itemNumber', 'title']
);

export const paperSchema = objectSchema({ organisationId: organisationIdField, paperId: paperIdField }, [
	'organisationId',
	'paperId'
]);

export const addRecordPaperSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		itemNumber: itemNumberField,
		title: titleField,
		source: { type: 'string', enum: [...boardRecordSources], description: 'Where in the organisation\'s records the paper is read from' },
		asAt: textField('For the trial balance or the balance sheet: the day it is read at the end of, written as 2026-10-31'),
		periodStart: textField('For the profit and loss: the first day of the period, written as 2026-10-01'),
		periodEnd: textField('For the profit and loss: the last day of the period, written as 2026-10-31'),
		costCentreId: textField('For the profit and loss: leave out for the whole organisation, or one cost centre by its id'),
		projectId: textField("For a project's progress: one of the organisation's projects, by its id"),
		pageId: textField('For a page of Your Business Brain: the page id, as read_business_brain_index or search_business_brain gives it')
	},
	['organisationId', 'meetingId', 'itemNumber', 'title', 'source']
);
