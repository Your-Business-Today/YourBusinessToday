import { fail } from '@sveltejs/kit';
import { isRefusal } from '$lib/server/portal/portalFormReading';
import { markContextPart } from '$lib/server/companyContext/markContextPart';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import { requireUser } from '$lib/server/auth/requireUser';
import { validatePartMark } from '$lib/server/companyContext/validatePartMark';
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
	}
} satisfies Actions;
