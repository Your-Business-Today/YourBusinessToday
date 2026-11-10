import { objectSchema, textField } from '../actionTypes';
import { boardPaperFileKinds, boardPaperLimits } from '$lib/data/boardroomPaperRules';
import { organisationIdField } from './organisationDetailsFields';

const { longestTitle, longestNote, longestFilename, largestByteCount } = boardPaperLimits;
const meetingIdField = textField('The meeting id, as list_board_meetings gives it');
const paperIdField = textField('The paper id, as read_board_meeting or add_board_paper gives it');

export const addPaperSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		itemNumber: {
			type: 'integer',
			minimum: 1,
			description: 'The agenda item the paper goes on, by its number as read_board_meeting gives it now'
		},
		title: textField(`What the paper is, such as "Management accounts to 31 October", at most ${longestTitle} characters`),
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
