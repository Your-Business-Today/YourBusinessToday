import { fail, type RequestEvent } from '@sveltejs/kit';
import { moveClientStage } from '$lib/server/clients/moveClientStage';
import { clientStageLabels, parseClientStage, validateClientStage } from '$lib/data/clientLifecycle';
import { registerOfStage } from '$lib/data/salesRegisters';
import { validateRecordId } from '$lib/data/isUuid';
import { requireStaff } from '$lib/server/auth/requireStaff';

/** Moves a record to another stage from either register; a record that signs, or falls back, changes register with it. */
export async function moveStageAction({ locals, request }: RequestEvent) {
	const user = await requireStaff(locals);
	const formData = await request.formData();
	const clientId = String(formData.get('clientId') ?? '');
	const requestedStage = String(formData.get('stage') ?? '');
	const refusal = validateRecordId('client', clientId) ?? validateClientStage(requestedStage);
	if (refusal !== null) return fail(400, { message: refusal });
	const stage = parseClientStage(requestedStage);
	await moveClientStage(locals.supabase, clientId, stage, user.id);
	const register = registerOfStage(stage);
	return { message: `Moved to ${clientStageLabels[stage]}. It is on ${register.title}.` };
}
