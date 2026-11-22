import { fail } from '@sveltejs/kit';
import { changeVideoDetails } from '$lib/server/projectVideos/changeProjectVideo';
import { findKeptVideo } from '$lib/server/projectVideos/findProjectVideos';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { validateVideoChanges } from '$lib/projectVideos/validateVideoDetails';
import type { Actions } from './$types';

const badRequest = 400;
const notFound = 404;

/** The Videos page's own door: change the title and description a video is shown with. */
export const videoActions: Actions = {
	changeVideo: async ({ locals, params, request }) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const changes = validateVideoChanges(readVideoWords(formData));
		if (typeof changes === 'string') return fail(badRequest, { message: `Not changed: ${changes}.` });
		const video = await findKeptVideo(locals.supabase, project.id, String(formData.get('videoId') ?? ''));
		if (video === null) return fail(notFound, { message: 'That video is no longer in the library.' });
		await changeVideoDetails(locals.supabase, video, changes);
		return {};
	}
};

/** The title and description as typed; an emptied description clears it, an emptied title is refused. */
function readVideoWords(formData: FormData): Record<string, unknown> {
	return { title: String(formData.get('title') ?? ''), description: String(formData.get('description') ?? '') };
}
