import { error, redirect } from '@sveltejs/kit';
import { businessBrainFilesBucket } from '$lib/server/businessBrain/businessBrainFileStorage';
import { findKeptFile } from '$lib/server/businessBrain/findBusinessBrainFiles';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import { signFetchLink } from '$lib/server/storage/signFetchLink';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const { organisation } = await requireOrganisationModule(locals, params.organisationId, 'business_brain');
	const file = await findKeptFile(locals.supabase, organisation.id, params.fileId);
	if (file === null) error(404, 'File not found');
	const signedLink = await signFetchLink(locals.supabase, businessBrainFilesBucket, file);
	redirect(303, signedLink);
};
