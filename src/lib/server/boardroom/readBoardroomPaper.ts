import type { SupabaseClient } from '@supabase/supabase-js';
import { boardroomPapersBucket } from './boardroomPaperStorage';
import { getBoardroomPaper } from './getBoardroomPapers';
import { getDirectorsOfOrganisation } from './getDirectorsOfOrganisation';
import { boardPaperRefusals } from '$lib/data/boardroomPaperRules';
import { describeNotePaper, filePaperLink } from '$lib/data/describeBoardroomPaper';
import { isFilePaper, isKept, type BoardroomFilePaper } from '$lib/data/boardroomPaper';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** A signed link lasts ten minutes: long enough for a Claude to fetch the file, too short to pass around. */
export const paperLinkLifetimeSeconds = 10 * 60;

async function signPaperLink(supabase: SupabaseClient, paper: BoardroomFilePaper): Promise<string> {
	const options = { download: paper.filename };
	const { data, error } = await supabase.storage
		.from(boardroomPapersBucket)
		.createSignedUrl(paper.storagePath, paperLinkLifetimeSeconds, options);
	if (error !== null) throw error;
	return data.signedUrl;
}

async function readFilePaper(supabase: SupabaseClient, paper: BoardroomFilePaper): Promise<string> {
	const link = await signPaperLink(supabase, paper);
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
