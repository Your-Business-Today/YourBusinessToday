import { error, fail, type ActionFailure } from '@sveltejs/kit';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { findPortalContractPack } from './portalContractPack';
import { commentRefusal, signatureRefusal } from './packSigningRefusals';
import { keepPackComment, keepPackSignature, type PackClient } from './clientPackSteps';
import { validatePackComment } from './validatePackComment';
import { validatePackSignature } from './validatePackSignature';
import type { ContractPack } from '$lib/data/contractPack';

const httpBadRequest = 400;
const httpNotFound = 404;
const noPackSent = 'Your Business Today has not sent your organisation a contract to sign.';

/** The client contact at the portal, their sent pack and how they write to it; a contact with no sent pack is a 404. */
export async function requirePortalPack(locals: App.Locals): Promise<{ client: PackClient; pack: ContractPack }> {
	const visitor = await requirePortalVisitor(locals);
	const { user } = await locals.safeGetSession();
	const service = supabaseServiceClient();
	const pack = await findPortalContractPack(service, visitor.clientId);
	if (pack === null) error(httpNotFound, noPackSent);
	return { client: { service, contactId: visitor.contactId, accountId: user?.id ?? '' }, pack };
}

type Refused = ActionFailure<{ message: string }>;

/** The portal's comment door: the comment checked against its columns and the pack, then kept. */
export async function commentOnPack(locals: App.Locals, form: FormData): Promise<Refused | { isCommented: true }> {
	const given = validatePackComment(Object.fromEntries(form));
	if (typeof given === 'string') return fail(httpBadRequest, { message: given });
	const { client, pack } = await requirePortalPack(locals);
	const refusal = commentRefusal(pack, given.documentId);
	if (refusal !== null) return fail(httpBadRequest, { message: refusal });
	await keepPackComment(client, pack, given);
	return { isCommented: true };
}

/** The portal's signing door: the signature checked against its columns, the pack and the version read, then kept. */
export async function signPackDocument(locals: App.Locals, form: FormData): Promise<Refused | { isSigned: true }> {
	const given = validatePackSignature(Object.fromEntries(form));
	if (typeof given === 'string') return fail(httpBadRequest, { message: given });
	const { client, pack } = await requirePortalPack(locals);
	const refusal = signatureRefusal(pack, given);
	if (refusal !== null) return fail(httpBadRequest, { message: refusal });
	await keepPackSignature(client, pack, given);
	return { isSigned: true };
}
