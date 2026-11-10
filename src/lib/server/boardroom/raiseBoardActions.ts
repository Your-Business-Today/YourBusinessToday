import type { SupabaseClient } from '@supabase/supabase-js';
import { insertActionRaising } from './saveBoardroomActions';
import { makeRaisedAction } from './makeRaisedAction';
import { noMeetingActions, raisedAsOf, raisingOf } from '$lib/data/boardroomAction';
import type { CarriedAction } from '$lib/data/carriedActions';
import type { RaisingOccasion } from '$lib/data/describeRaisedAction';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

/** The actions raised now, and those whose making failed, which stay on the meeting until a director asks again. */
export type ActionsRaised = { raised: CarriedAction[]; notRaised: CarriedAction[] };

/** The id to make an action with: the one its raising already holds, or a new one under a key this raiser wrote first. */
async function madeIdFor(supabase: SupabaseClient, record: MeetingRecord, occasion: RaisingOccasion, { action }: CarriedAction): Promise<string | null> {
	const kept = raisingOf(record.actions ?? noMeetingActions, action.id);
	if (kept !== null) return kept.madeId;
	const madeId = crypto.randomUUID();
	const { meeting, raisedBy } = occasion;
	const key = { meeting, actionId: action.id, raisedAs: raisedAsOf(action), madeId, raisedBy };
	const isFirst = await insertActionRaising(supabase, key);
	return isFirst ? madeId : null;
}

async function raiseOne(supabase: SupabaseClient, record: MeetingRecord, occasion: RaisingOccasion, carried: CarriedAction): Promise<boolean | null> {
	try {
		const madeId = await madeIdFor(supabase, record, occasion, carried);
		if (madeId === null) return null;
		await makeRaisedAction(supabase, occasion, { carried, madeId });
		return true;
	} catch {
		return false;
	}
}

/**
 * Raises each action given, at most once: the key is written first with the id the task or to-do will have, and
 * a second raiser meets it and stops. A making that fails is reported, never tried again unasked.
 */
export async function raiseBoardActions(supabase: SupabaseClient, record: MeetingRecord, occasion: RaisingOccasion, toRaise: CarriedAction[]): Promise<ActionsRaised> {
	const outcomes = await Promise.all(toRaise.map((carried) => raiseOne(supabase, record, occasion, carried)));
	const raised = toRaise.filter((_carried, index) => outcomes[index] === true);
	const notRaised = toRaise.filter((_carried, index) => outcomes[index] === false);
	return { raised, notRaised };
}
