import { error, json } from '@sveltejs/kit';
import { isRefusal } from '$lib/server/portal/portalFormReading';
import { readFramePicks } from '$lib/server/frame/readFramePicks';
import { rememberPick } from '$lib/server/frame/rememberedPicks';
import {
	refusalOfPick,
	rememberedWithChoice,
	validateFramePickChoice
} from '$lib/server/frame/framePickChoice';
import type { RequestHandler } from './$types';

const badRequest = 400;
const unauthorised = 401;

/** Remembers the organisation and project a person picked in the side bar, and says where its home page is. */
export const POST: RequestHandler = async ({ locals, request, cookies }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(unauthorised, 'Sign in to pick an organisation.');
	const choice = validateFramePickChoice(await request.json().catch(() => null));
	if (isRefusal(choice)) error(badRequest, choice.refusal);
	const remembered = locals.rememberedPicks;
	const { picks, organisation } = await readFramePicks(locals, user.id, rememberedWithChoice(remembered, choice));
	const refusal = refusalOfPick(picks, choice);
	if (refusal !== null || organisation === null) error(badRequest, refusal?.refusal);
	const { portalClientId } = organisation;
	rememberPick(cookies, remembered, { organisationId: organisation.id, projectId: picks.pickedProjectId, portalClientId });
	return json({ homePath: picks.homePath });
};
