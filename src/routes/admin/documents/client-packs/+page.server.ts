import { fail, redirect } from '@sveltejs/kit';
import { blankSources, contractBlanks } from '$lib/data/contractBlanks';
import { clientDocumentsFor, documentAudiences } from '$lib/data/clientDocumentCatalogue';
import { contractOptionalClauses } from '$lib/data/contractOptionalClauses';
import { isUuid, validateRecordId } from '$lib/data/isUuid';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import { requireUser } from '$lib/server/auth/requireUser';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { prepareContractPack } from '$lib/server/contractPacks/prepareContractPack';
import { readContractPack } from '$lib/server/contractPacks/readContractPack';
import { packInputFromForm } from '$lib/server/contractPacks/packInputFromForm';
import { validateContractPackRequest } from '$lib/server/contractPacks/validateContractPackRequest';
import { planSendingOfPack } from '$lib/server/contractPacks/packSendingDoor';
import { sendContractPack, undeliveredPackNotices } from '$lib/server/contractPacks/sendContractPack';
import { emailDeliveries } from '$lib/data/emailDelivery';
import { ukClockAt } from '$lib/data/ukClock';
import { isAwaitingCountersignature } from '$lib/data/contractPack';
import { countersignPack } from '$lib/server/contractPacks/countersignDoor';
import type { Actions, PageServerLoad } from './$types';

const httpBadRequest = 400;
const httpNotFound = 404;
const httpSeeOther = 303;
const noSuchOrganisation = 'That organisation is not there any more.';
const clientPacksPath = '/admin/documents/client-packs';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireAdmin(locals);
	const organisations = await getOrganisations(locals.supabase);
	const organisationId = url.searchParams.get('organisationId') ?? '';
	const picked = isUuid(organisationId) ? (organisations.find(({ id }) => id === organisationId) ?? null) : null;
	const pack = picked === null ? null : await readContractPack(locals.supabase, picked.id);
	const sending = pack === null || picked === null ? null : await planSendingOfPack(locals.supabase, picked, { packId: pack.id, contactId: null });
	return {
		organisations: organisations.map(({ id, name }) => ({ id, name })),
		picked: picked === null ? null : { id: picked.id, name: picked.name },
		pack,
		sending,
		isAwaitingCountersignature: pack !== null && isAwaitingCountersignature(pack),
		today: ukClockAt(new Date()).date,
		contractDocuments: clientDocumentsFor(documentAudiences.client),
		optionalClauses: contractOptionalClauses.map(({ slug, title, summary, isChosenByDefault }) => ({ slug, title, summary, isChosenByDefault })),
		writtenBlanks: contractBlanks.filter((blank) => blank.source === blankSources.pack)
	};
};

export const actions = {
	prepare: async ({ locals, request }) => {
		await requireAdmin(locals);
		const user = await requireUser(locals);
		const packRequest = validateContractPackRequest(packInputFromForm(await request.formData()));
		if (typeof packRequest === 'string') return fail(httpBadRequest, { message: packRequest });
		const organisation = await getOrganisation(locals.supabase, packRequest.organisationId);
		if (organisation === null) return fail(httpNotFound, { message: noSuchOrganisation });
		await prepareContractPack({ supabase: locals.supabase, accountId: user.id, organisation }, packRequest);
		redirect(httpSeeOther, `${clientPacksPath}?organisationId=${organisation.id}`);
	},
	send: async ({ locals, request }) => {
		await requireAdmin(locals);
		const form = await request.formData();
		const organisationId = String(form.get('organisationId') ?? '');
		const idRefusal = validateRecordId('organisationId', organisationId);
		if (idRefusal !== null) return fail(httpBadRequest, { sendMessage: idRefusal });
		const organisation = await getOrganisation(locals.supabase, organisationId);
		if (organisation === null) return fail(httpNotFound, { sendMessage: noSuchOrganisation });
		const sendingRequest = { packId: String(form.get('packId') ?? ''), contactId: String(form.get('contactId') ?? '') };
		const plan = await planSendingOfPack(locals.supabase, organisation, sendingRequest);
		if (typeof plan === 'string') return fail(httpBadRequest, { sendMessage: plan });
		const delivery = await sendContractPack(locals.supabase, plan);
		if (delivery !== emailDeliveries.sent) return fail(httpBadRequest, { sendMessage: undeliveredPackNotices[delivery] });
		redirect(httpSeeOther, `${clientPacksPath}?organisationId=${organisation.id}`);
	},
	countersign: async ({ locals, request }) => {
		await requireAdmin(locals);
		const user = await requireUser(locals);
		const form = Object.fromEntries(await request.formData());
		const organisationId = String(form.organisationId ?? '');
		const idRefusal = validateRecordId('organisationId', organisationId);
		if (idRefusal !== null) return fail(httpBadRequest, { countersignMessage: idRefusal });
		const organisation = await getOrganisation(locals.supabase, organisationId);
		if (organisation === null) return fail(httpNotFound, { countersignMessage: noSuchOrganisation });
		const pack = await countersignPack({ supabase: locals.supabase, accountId: user.id, organisation }, form);
		if (typeof pack === 'string') return fail(httpBadRequest, { countersignMessage: pack });
		redirect(httpSeeOther, `${clientPacksPath}?organisationId=${organisation.id}`);
	}
} satisfies Actions;
