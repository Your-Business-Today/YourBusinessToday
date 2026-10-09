import { error, redirect } from '@sveltejs/kit';
import {
	issueAuthorizationCode,
	redirectBackWithCode,
	redirectBackWithRefusal
} from '$lib/server/oauth/issueAuthorizationCode';
import {
	readAuthorizationRequest,
	type AuthorizationRequest
} from '$lib/server/oauth/authorizationRequest';
import {
	resolveAccountStanding,
	type AccountStanding
} from '$lib/server/mcp/resolveAccountStanding';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Actions, PageServerLoad } from './$types';

const badRequest = 400;
const forbidden = 403;
const seeOther = 303;

const invalidConnectionRequest =
	'That connection request is not valid. Start again from the app you are connecting.';
const accountCannotConnect =
	'This account cannot connect. Ask Your Business Today if that is unexpected.';

export const load: PageServerLoad = async ({ locals, url }) => {
	const authorizationRequest = await requireAuthorizationRequest(url);
	const standing = await requireStandingThatMayConnect(locals, url);
	return {
		clientName: authorizationRequest.clientName,
		email: standing.email,
		isStaff: standing.isStaff,
		ownedProjectCount: standing.ownedProjectIds.length,
		memberProjectCount: standing.memberProjectIds.length,
		isAdmin: standing.isAdmin,
		approvePath: pathForNamedAction(url, 'approve'),
		refusePath: pathForNamedAction(url, 'refuse')
	};
};

export const actions: Actions = {
	approve: async ({ locals, url }) => {
		const authorizationRequest = await requireAuthorizationRequest(url);
		const standing = await requireStandingThatMayConnect(locals, url);
		const code = await issueAuthorizationCode(authorizationRequest, standing.accountId);
		redirect(seeOther, redirectBackWithCode(authorizationRequest, code));
	},
	refuse: async ({ url }) => {
		const authorizationRequest = await requireAuthorizationRequest(url);
		redirect(seeOther, redirectBackWithRefusal(authorizationRequest));
	}
};

async function requireAuthorizationRequest(url: URL): Promise<AuthorizationRequest> {
	const authorizationRequest = await readAuthorizationRequest(url.searchParams);
	if (authorizationRequest === null) error(badRequest, invalidConnectionRequest);
	return authorizationRequest;
}

async function requireStandingThatMayConnect(
	locals: App.Locals,
	url: URL
): Promise<AccountStanding> {
	const { user } = await locals.safeGetSession();
	if (user === null) {
		const signInUrl = signInThenReturn(url);
		redirect(seeOther, signInUrl);
	}
	const standing = await resolveAccountStanding(supabaseServiceClient(), user.id);
	if (standing === null) error(forbidden, accountCannotConnect);
	return standing;
}

// A form posting to "?/approve" would replace the query string and lose the
// authorization parameters the action has to read back, so the parameters are
// carried alongside the action name.
function pathForNamedAction(url: URL, actionName: string): string {
	return `${url.pathname}${url.search}&/${actionName}`;
}

function signInThenReturn(url: URL): string {
	return `/account/sign-in?next=${encodeURIComponent(`${url.pathname}${url.search}`)}`;
}
