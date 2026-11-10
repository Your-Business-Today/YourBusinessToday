import { error, redirect } from '@sveltejs/kit';
import { requireBoardroomDirector } from '$lib/server/auth/requireBoardroomDirector';
import { getBoardroomPaper } from '$lib/server/boardroom/getBoardroomPapers';
import { boardroomPapersBucket } from '$lib/server/boardroom/boardroomPaperStorage';
import { signFetchLink } from '$lib/server/storage/signFetchLink';
import { isFilePaper, isKept, type BoardroomPaper } from '$lib/data/boardroomPaper';
import { boardPaperRefusals } from '$lib/data/boardroomPaperRules';
import { isUuid } from '$lib/data/isUuid';
import type { RequestHandler } from './$types';

const seeOtherStatus = 303;
const notFoundStatus = 404;

function isOnTheMeeting(paper: BoardroomPaper | null, meetingId: string): paper is BoardroomPaper {
	if (paper === null) return false;
	return paper.meetingId === meetingId && isKept(paper);
}

/** A file paper opens through a ten-minute signed link, asked for afresh by a director each time. */
export const GET: RequestHandler = async ({ locals, params }) => {
	const { organisation } = await requireBoardroomDirector(locals, params.organisationId);
	if (!isUuid(params.paperId)) error(notFoundStatus, boardPaperRefusals.noSuchPaper);
	const paper = await getBoardroomPaper(locals.supabase, organisation.id, params.paperId);
	if (!isOnTheMeeting(paper, params.meetingId) || !isFilePaper(paper)) error(notFoundStatus, boardPaperRefusals.noSuchPaper);
	const link = await signFetchLink(locals.supabase, boardroomPapersBucket, paper);
	redirect(seeOtherStatus, link);
};
