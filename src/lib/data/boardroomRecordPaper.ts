import type { OrganisationModule } from './organisationModules';

/** Where in Your Business Today a board paper can be read from; migration 0162 holds the same list. */
export const boardRecordSources = [
	'trial_balance',
	'profit_and_loss',
	'balance_sheet',
	'project_progress',
	'business_brain_page'
] as const;

export type BoardRecordSource = (typeof boardRecordSources)[number];

/** The module each source belongs to, whose rule decides who may take it and read it; a project's progress has none. */
export const boardRecordSourceModules: Record<BoardRecordSource, OrganisationModule | null> = {
	trial_balance: 'books',
	profit_and_loss: 'books',
	balance_sheet: 'books',
	project_progress: null,
	business_brain_page: 'business_brain'
};

/** The words a director knows each source by. */
export const boardRecordSourceWords: Record<BoardRecordSource, string> = {
	trial_balance: 'the trial balance from the books',
	profit_and_loss: 'the profit and loss from the books',
	balance_sheet: 'the balance sheet from the books',
	project_progress: "a project's progress",
	business_brain_page: 'a page of Your Business Brain'
};

/** What is asked of the source: the days and cost centre of a report, or the project or page by its id. */
export type BoardRecordAsked = {
	source: BoardRecordSource;
	periodStart: string | null;
	periodEnd: string | null;
	costCentreId: string | null;
	recordId: string | null;
};

/** A paper from the records as a director gives it: the agenda item by its number now, its title and what to read. */
export type BoardRecordPaperDraft = { itemNumber: number; title: string; asked: BoardRecordAsked };

/** A reading taken from the records, word for word, or the sentence saying why none was taken. */
export type TakenReading = { reading: string } | string;

/** One paper read from the records, kept word for word as it stood when it was taken. */
export type BoardroomRecordPaper = BoardRecordAsked & {
	id: string;
	organisationId: string;
	meetingId: string;
	agendaItemId: string;
	title: string;
	reading: string;
	takenAt: string;
	addedByDirectorId: string;
	addedBy: string | null;
};

export function isBoardRecordSource(candidate: unknown): candidate is BoardRecordSource {
	return (boardRecordSources as readonly unknown[]).includes(candidate);
}

/** The record papers on one agenda item, in the order they were taken. */
export function recordPapersOfItem(papers: BoardroomRecordPaper[], agendaItemId: string): BoardroomRecordPaper[] {
	return papers.filter((paper) => paper.agendaItemId === agendaItemId);
}
