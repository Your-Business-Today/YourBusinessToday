import { fail } from '@sveltejs/kit';
import { isRefused } from '$lib/server/companyContext/contextText';
import { markWorkflowMapStation } from '$lib/server/workflowMap/markWorkflowMapStation';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import { requireUser } from '$lib/server/auth/requireUser';
import { validateStationMarkForm } from '$lib/server/workflowMap/validateStationMark';
import type { Actions } from './$types';

const badRequest = 400;

export const portalWorkflowMapActions = {
	markStation: async ({ locals, request }) => {
		const user = await requireUser(locals);
		const visitor = await requirePortalVisitor(locals);
		const mark = validateStationMarkForm(await request.formData());
		if (isRefused(mark)) return fail(badRequest, { message: mark.refusal });
		const refusal = await markWorkflowMapStation({ clientId: visitor.clientId, accountId: user.id }, mark);
		if (refusal !== null) return fail(badRequest, { message: refusal.refusal });
		return { message: 'Saved.' };
	}
} satisfies Actions;
