import type { SupabaseClient } from '@supabase/supabase-js';
import { findOrganisationMember, getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getDirectorsOfOrganisation } from './getDirectorsOfOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { nameBoardroomDirector } from './nameBoardroomDirector';
import { standDownBoardroomDirector } from './standDownBoardroomDirector';
import { findSittingSeat } from './findSittingSeat';
import { sittingSeatOf, type BoardroomDirector } from '$lib/data/boardroomDirector';
import {
	alreadySittingSentence,
	boardroomDirectorRefusals,
	directorNameRefusal,
	namedSentence,
	notSittingSentence,
	stoodDownSentence
} from '$lib/data/boardroomDirectorRules';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Name someone a director of an organisation, or stand one down; member is their account id, email or name. */
export type DirectorChange = { member: string; isDirector: boolean; changedBy: string };

export type DirectorChangeOutcome = { isRefusal: boolean; message: string };

type Board = { organisation: Organisation; directors: BoardroomDirector[] };

const refusal = (message: string): DirectorChangeOutcome => ({ isRefusal: true, message });
const done = (message: string): DirectorChangeOutcome => ({ isRefusal: false, message });

export async function setBoardroomDirector(
	supabase: SupabaseClient,
	organisation: Organisation,
	change: DirectorChange
): Promise<DirectorChangeOutcome> {
	const switchedOn = await getSwitchedOnModules(supabase, organisation.id);
	if (!switchedOn.includes('boardroom')) return refusal(boardroomDirectorRefusals.boardroomIsOff);
	const directors = await getDirectorsOfOrganisation(supabase, organisation.id);
	const board = { organisation, directors };
	if (change.isDirector) return seatDirector(supabase, board, change);
	return standDown(supabase, board, change);
}

async function seatDirector(supabase: SupabaseClient, board: Board, change: DirectorChange): Promise<DirectorChangeOutcome> {
	const organisation = board.organisation;
	const members = await getMembersOfOrganisation(supabase, organisation.id);
	const member = findOrganisationMember(members, change.member);
	if (member === null) return refusal(boardroomDirectorRefusals.notOnTheOrganisation);
	const existingSeat = sittingSeatOf(board.directors, member.id);
	const alreadySitting = alreadySittingSentence(member.name, organisation.name);
	if (existingSeat !== null) return refusal(alreadySitting);
	const nameRefusal = directorNameRefusal(member.name);
	if (nameRefusal !== null) return refusal(nameRefusal);
	const naming = { organisationId: organisation.id, accountId: member.id, name: member.name, namedBy: change.changedBy };
	await nameBoardroomDirector(supabase, naming);
	return done(namedSentence(member.name, organisation.name));
}

async function standDown(supabase: SupabaseClient, board: Board, change: DirectorChange): Promise<DirectorChangeOutcome> {
	const organisation = board.organisation;
	const seat = await findSittingSeat(supabase, organisation.id, board.directors, change.member);
	const notSitting = notSittingSentence(change.member, organisation.name);
	if (seat === null) return refusal(notSitting);
	await standDownBoardroomDirector(supabase, seat.id, change.changedBy);
	return done(stoodDownSentence(seat.name, organisation.name));
}
