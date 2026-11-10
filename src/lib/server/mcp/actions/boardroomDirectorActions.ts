import { boardroomAction } from '../boardroomGate';
import { boardroomDirectorRefusals } from '$lib/data/boardroomDirectorRules';
import { describeBoardroom } from '$lib/data/describeBoardroom';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { objectSchema, readText, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { setBoardroomDirector } from '$lib/server/boardroom/setBoardroomDirector';
import type { McpAction } from '../actionTypes';

const memberField = textField(
	'Their account id, email or name, as read_organisation gives it. A director is named from the people on the organisation itself'
);
const isDirectorField = { type: 'boolean', description: 'true names them a director, false stands them down' };

export const boardroomDirectorActions: McpAction[] = [
	{
		name: 'set_organisation_director',
		area: 'organisations',
		audience: 'staff',
		isWrite: true,
		summary: "name someone on an organisation one of its directors, who alone enter its boardroom, or stand one down",
		guidance:
			'Boardroom must be switched on for the organisation first. Directors are named from the people on the ' +
			'organisation itself, never from the organisation above it. Naming the directors does not let the ' +
			'administrator in. A director who is stood down keeps their name on every meeting they took part in and ' +
			'enters no new ones; nothing of theirs is deleted.',
		inputSchema: objectSchema({ organisationId: organisationIdField, member: memberField, isDirector: isDirectorField }, [
			'organisationId',
			'member',
			'isDirector'
		]),
		run: async (caller, input) => {
			if (typeof input.isDirector !== 'boolean') return boardroomDirectorRefusals.isDirectorNotBoolean;
			const organisation = await reachableOrganisation(caller, readText(input, 'organisationId'));
			if (organisation === null) return noSuchOrganisation;
			const change = { member: readText(input, 'member'), isDirector: input.isDirector, changedBy: caller.accountId };
			const outcome = await setBoardroomDirector(caller.supabase, organisation, change);
			return outcome.message;
		}
	},
	boardroomAction({
		name: 'read_boardroom',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary: "enter an organisation's boardroom as one of its directors: who sits on its board, and who once did",
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, _input, organisation) => {
			const directors = await getDirectorsOfOrganisation(caller.supabase, organisation.id);
			return describeBoardroom(organisation.name, directors);
		}
	})
];
