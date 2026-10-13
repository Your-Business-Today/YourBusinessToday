import { fail } from '@sveltejs/kit';
import { isRefusal, validatePortalReply, validatePortalRequest } from '$lib/server/portal/validatePortalRequest';
import { raisePortalRequest } from '$lib/server/portal/raisePortalRequest';
import { replyToPortalRequest } from '$lib/server/portal/replyToPortalRequest';
import { requirePortalProject } from '$lib/server/portal/requirePortalProject';
import type { Actions } from './$types';

const badRequest = 400;

export const portalRequestActions = {
	raiseRequest: async ({ locals, params, request }) => {
		const { accountId, visitor, project } = await requirePortalProject(locals, params.projectId);
		const seed = validatePortalRequest(await request.formData());
		if (isRefusal(seed)) return fail(badRequest, { message: seed.refusal });
		const raised = await raisePortalRequest(accountId, project.id, seed, visitor.role);
		if (isRefusal(raised)) return fail(badRequest, { message: raised.refusal });
		return { message: `Raised "${seed.title}". The answer will appear under your requests.` };
	},
	replyToRequest: async ({ locals, params, request }) => {
		const { accountId } = await requirePortalProject(locals, params.projectId);
		const reply = validatePortalReply(await request.formData());
		if (isRefusal(reply)) return fail(badRequest, { message: reply.refusal });
		const refusal = await replyToPortalRequest(locals.supabase, accountId, reply);
		if (refusal !== null) return fail(badRequest, { message: refusal.refusal });
		return {};
	}
} satisfies Actions;
