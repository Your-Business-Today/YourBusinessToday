import { isUuid } from '$lib/data/isUuid';
import { describeRecordPaper } from '$lib/data/describeBoardroomRecordPaper';
import { getBoardroomRecordPaper } from '$lib/server/boardroom/getBoardroomRecordPapers';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { readBoardroomPaper } from '$lib/server/boardroom/readBoardroomPaper';
import { maySourceBeRead, readingSwitchedOff } from './boardRecordReadings';
import type { BoardroomRecordPaper } from '$lib/data/boardroomRecordPaper';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

async function findRecordPaper(caller: McpCaller, organisation: Organisation, paperId: string): Promise<BoardroomRecordPaper | null> {
	if (!isUuid(paperId)) return null;
	return getBoardroomRecordPaper(caller.supabase, organisation.id, paperId);
}

async function readRecordPaper(caller: McpCaller, organisation: Organisation, paper: BoardroomRecordPaper): Promise<string> {
	const mayBeRead = await maySourceBeRead(caller, organisation, paper.source);
	if (!mayBeRead) return readingSwitchedOff(paper.source);
	const directors = await getDirectorsOfOrganisation(caller.supabase, organisation.id);
	return describeRecordPaper(paper, directors);
}

/**
 * Any paper on the board by its id: one taken from the records, read through its module's rule as it stood
 * when taken; otherwise a written note as its text, or a file as a link to fetch it from.
 */
export async function readAnyBoardPaper(caller: McpCaller, organisation: Organisation, paperId: string): Promise<string> {
	const recordPaper = await findRecordPaper(caller, organisation, paperId);
	if (recordPaper === null) return readBoardroomPaper(caller.supabase, organisation, paperId);
	return readRecordPaper(caller, organisation, recordPaper);
}
