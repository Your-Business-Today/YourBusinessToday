import { fail, redirect } from '@sveltejs/kit';
import { blankSources, contractBlanks } from '$lib/data/contractBlanks';
import { clientDocumentsFor, documentAudiences } from '$lib/data/clientDocumentCatalogue';
import { contractOptionalClauses } from '$lib/data/contractOptionalClauses';
import { isUuid } from '$lib/data/isUuid';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import { requireUser } from '$lib/server/auth/requireUser';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { prepareContractPack } from '$lib/server/contractPacks/prepareContractPack';
import { readContractPack } from '$lib/server/contractPacks/readContractPack';
import { packInputFromForm } from '$lib/server/contractPacks/packInputFromForm';
import { validateContractPackRequest } from '$lib/server/contractPacks/validateContractPackRequest';
import type { Actions, PageServerLoad } from './$types';

const httpBadRequest = 400;
const httpNotFound = 404;
const httpSeeOther = 303;
const noSuchOrganisation = 'That organisation is not there any more.';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireAdmin(locals);
	const organisations = await getOrganisations(locals.supabase);
	const organisationId = url.searchParams.get('organisationId') ?? '';
	const picked = isUuid(organisationId) ? (organisations.find(({ id }) => id === organisationId) ?? null) : null;
	return {
		organisations: organisations.map(({ id, name }) => ({ id, name })),
		picked: picked === null ? null : { id: picked.id, name: picked.name },
		pack: picked === null ? null : await readContractPack(locals.supabase, picked.id),
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
		redirect(httpSeeOther, `/admin/documents/client-packs?organisationId=${organisation.id}`);
	}
} satisfies Actions;
