import { fail } from '@sveltejs/kit';
import { isRefused } from '$lib/server/companyContext/contextText';
import { confirmWorkflowMap } from '$lib/server/workflowMap/confirmWorkflowMap';
import { markWorkflowMapStation } from '$lib/server/workflowMap/markWorkflowMapStation';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import { requireUser } from '$lib/server/auth/requireUser';
import { validateMapConfirmationForm } from '$lib/server/workflowMap/validateMapConfirmation';
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
	},
	confirmMap: async ({ locals, request, url }) => {
		const user = await requireUser(locals);
		const visitor = await requirePortalVisitor(locals);
		const choice = validateMapConfirmationForm(await request.formData());
		if (isRefused(choice)) return fail(badRequest, { message: choice.refusal });
		const confirmer = {
			clientId: visitor.clientId,
			accountId: user.id,
			organisationName: visitor.organisationName,
			siteOrigin: url.origin
		};
		const refusal = await confirmWorkflowMap(confirmer, choice);
		if (refusal !== null) return fail(badRequest, { message: refusal.refusal });
		return { message: 'Confirmed.' };
	}
} satisfies Actions;
