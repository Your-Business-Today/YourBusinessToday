import { fail } from '@sveltejs/kit';
import { confirmCompanyContext } from '$lib/server/companyContext/confirmCompanyContext';
import { isRefusal, textOf } from '$lib/server/portal/portalFormReading';
import { markContextPart } from '$lib/server/companyContext/markContextPart';
import { partMarkFields, readVersionNumber, validatePartMark } from '$lib/server/companyContext/validatePartMark';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import { requireUser } from '$lib/server/auth/requireUser';
import type { Actions } from './$types';

const badRequest = 400;

export const portalContextActions = {
	markPart: async ({ locals, request }) => {
		const user = await requireUser(locals);
		const visitor = await requirePortalVisitor(locals);
		const mark = validatePartMark(await request.formData());
		if (isRefusal(mark)) return fail(badRequest, { message: mark.refusal });
		const marker = { clientId: visitor.clientId, accountId: user.id };
		const refusal = await markContextPart(marker, mark);
		if (refusal !== null) return fail(badRequest, { message: refusal.refusal });
		return { message: 'Saved.' };
	},
	confirmContext: async ({ locals, request, url }) => {
		const user = await requireUser(locals);
		const visitor = await requirePortalVisitor(locals);
		const formData = await request.formData();
		const versionNumber = readVersionNumber(textOf(formData, partMarkFields.versionNumber));
		if (typeof versionNumber !== 'number') return fail(badRequest, { message: versionNumber.refusal });
		const confirmer = {
			clientId: visitor.clientId,
			accountId: user.id,
			organisationName: visitor.organisationName,
			siteOrigin: url.origin
		};
		const refusal = await confirmCompanyContext(confirmer, versionNumber);
		if (refusal !== null) return fail(badRequest, { message: refusal.refusal });
		return { message: 'Confirmed.' };
	}
} satisfies Actions;
