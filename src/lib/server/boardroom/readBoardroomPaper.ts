import type { SupabaseClient } from '@supabase/supabase-js';
import { boardroomPapersBucket } from './boardroomPaperStorage';
import { signFetchLink } from '$lib/server/storage/signFetchLink';
import { getBoardroomPaper } from './getBoardroomPapers';
import { getDirectorsOfOrganisation } from './getDirectorsOfOrganisation';
import { boardPaperRefusals } from '$lib/data/boardroomPaperRules';
import { describeNotePaper, filePaperLink } from '$lib/data/describeBoardroomPaper';
import { isFilePaper, isKept, type BoardroomFilePaper } from '$lib/data/boardroomPaper';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

async function readFilePaper(supabase: SupabaseClient, paper: BoardroomFilePaper): Promise<string> {
	const link = await signFetchLink(supabase, boardroomPapersBucket, paper);
	return filePaperLink(paper, link);
}

/** One paper on an organisation's board: a written note as its text, a file as a signed link to fetch it from. */
export async function readBoardroomPaper(supabase: SupabaseClient, organisation: Organisation, paperId: string): Promise<string> {
	const paper = await getBoardroomPaper(supabase, organisation.id, paperId);
	if (paper === null || !isKept(paper)) return boardPaperRefusals.noSuchPaper;
	if (isFilePaper(paper)) return readFilePaper(supabase, paper);
	const directors = await getDirectorsOfOrganisation(supabase, organisation.id);
	return describeNotePaper(paper, directors);
}
