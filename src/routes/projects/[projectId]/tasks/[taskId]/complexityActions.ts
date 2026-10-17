import { fail } from '@sveltejs/kit';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { setTaskComplexity } from '$lib/server/projects/setTaskComplexity';
import { validateTaskComplexity } from '$lib/data/validateTaskComplexity';
import type { Actions } from './$types';

export const complexityActions = {
	setComplexity: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const complexity = validateTaskComplexity({
			viewsChanged: formData.get('viewsChanged'),
			newViews: formData.get('newViews'),
			changesDataStructure: formData.get('changesDataStructure') === 'on',
			domainObjects: formData.get('domainObjects')
		});
		if (typeof complexity === 'string') return fail(400, { message: complexity });
		const storyPoints = await setTaskComplexity(locals.supabase, params.taskId, complexity);
		return { message: `Sized at ${storyPoints} points from its measures.` };
	}
} satisfies Actions;
