import { resolveUploadLinkHolder } from '$lib/server/auth/resolveUploadLinkHolder';
import { uploadActions } from './uploadActions';
import { uploadPageLifetimeMinutes } from '$lib/server/projects/taskUploadLink';
import type { Actions, PageServerLoad } from './$types';

/** The page behind an upload link: no sign-in, because holding the link is the permission. */
export const load: PageServerLoad = async ({ params }) => {
	const holder = await resolveUploadLinkHolder(params.token);
	const linkLifetimeMinutes = uploadPageLifetimeMinutes;
	if (holder === null) return { taskTitle: null, linkLifetimeMinutes };
	const { task } = holder;
	return { taskTitle: task.title, linkLifetimeMinutes };
};

export const actions: Actions = { ...uploadActions };
