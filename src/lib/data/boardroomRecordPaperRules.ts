import { boardPaperLimits } from './boardroomPaperRules';
import { boardRecordSources, boardRecordSourceWords, type BoardRecordSource } from './boardroomRecordPaper';

/** The limits of boardroom_record_papers (migration 0162), stated once for the service and its tests. */
export const boardRecordPaperLimits = {
	longestTitle: boardPaperLimits.longestTitle,
	longestReading: 200000
} as const;

/** The fields each source is read by: the first ones it needs, then any it may also take. */
export const boardRecordSourceFields: Record<BoardRecordSource, { needed: string[]; optional: string[] }> = {
	trial_balance: { needed: ['asAt'], optional: [] },
	balance_sheet: { needed: ['asAt'], optional: [] },
	profit_and_loss: { needed: ['periodStart', 'periodEnd'], optional: ['costCentreId'] },
	project_progress: { needed: ['projectId'], optional: [] },
	business_brain_page: { needed: ['pageId'], optional: [] }
};

export const everyBoardRecordField = ['asAt', 'periodStart', 'periodEnd', 'costCentreId', 'projectId', 'pageId'];

export const boardRecordPaperRefusals = {
	sourceNotKnown: `source is where the paper is read from, one of ${boardRecordSources.join(', ')}.`,
	readingTooLong: `That reading is longer than ${boardRecordPaperLimits.longestReading} characters, too long to keep as a paper. ` +
		'Narrow it, or send it as a file with add_board_paper.',
	noSuchProject: 'No project of this organisation that you are on has that projectId. read_organisation lists its projects.'
} as const;

export function fieldNotForSource(field: string, source: BoardRecordSource): string {
	const { needed, optional } = boardRecordSourceFields[source];
	const allowed = [...needed, ...optional].join(', ');
	return `${field} does not belong to ${boardRecordSourceWords[source]}; it is read by ${allowed} alone.`;
}

export function fieldNeededForSource(field: string, source: BoardRecordSource): string {
	return `${boardRecordSourceWords[source]} needs ${field}.`;
}

const switchedOffOpening = (moduleLabel: string) => `${moduleLabel} is not switched on for this organisation, or not for you`;

export function moduleSwitchedOffForSource(source: BoardRecordSource, moduleLabel: string): string {
	return `${switchedOffOpening(moduleLabel)}, so ${boardRecordSourceWords[source]} cannot be a paper.`;
}

export function moduleSwitchedOffForReading(source: BoardRecordSource, moduleLabel: string): string {
	return `${switchedOffOpening(moduleLabel)}, so this paper, taken from ${boardRecordSourceWords[source]}, cannot be read.`;
}
