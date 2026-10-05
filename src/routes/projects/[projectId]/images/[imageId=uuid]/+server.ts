import { error, redirect } from '@sveltejs/kit';
import { findProjectImage } from '$lib/server/projectImages/findProjectImage';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import {
	clickThroughLifetimeSeconds,
	signAttachmentLink
} from '$lib/server/projects/signAttachmentLink';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const image = await findProjectImage(locals.supabase, project.id, params.imageId);
	if (image === null) error(404, 'Image not found');
	const signedLink = await signAttachmentLink(locals.supabase, image, 'open', clickThroughLifetimeSeconds);
	redirect(303, signedLink);
};
