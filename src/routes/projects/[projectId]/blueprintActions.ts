import { fail } from '@sveltejs/kit';
import { createTask, readNewTaskSeed } from '$lib/server/projects/createTask';
import { describeBlueprintReading } from '$lib/server/blueprint/describeBlueprintReading';
import { describeChangeSubject } from '$lib/data/blueprint/changeSubject';
import { newTaskRefusal } from '$lib/server/projects/newTaskRefusal';
import { similarTasksFailure } from '$lib/server/projects/similarTasksForNewTask';
import { validateChangeSubject } from '$lib/server/blueprint/validateChangeSubject';
import { readProjectBlueprint } from '$lib/server/blueprint/readProjectBlueprint';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { withRaiserAutocomplete } from '$lib/data/autocompleteStanding';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { RequestEvent } from '@sveltejs/kit';

type ProjectPageEvent = RequestEvent<{ projectId: string }>;

/** The actions the domain and the site map pages share: read the repository again, and raise a change as a task. */
export const blueprintActions = {
	readBlueprint: async ({ locals, params }: ProjectPageEvent) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const reading = await readProjectBlueprint(supabaseServiceClient(), project);
		return { message: describeBlueprintReading(reading) };
	},
	raiseChange: async ({ locals, params, request }: ProjectPageEvent) => {
		const { user, project } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const subjectReading = validateChangeSubject(formData);
		if ('refusal' in subjectReading) return fail(400, { message: subjectReading.refusal });
		const seed = readNewTaskSeed(formData);
		if (seed === null) return fail(400, { message: 'Say what should change.' });
		const raisedFrom = `Raised from ${describeChangeSubject(subjectReading.subject)}.`;
		const change = { ...seed, details: [raisedFrom, seed.details].filter(Boolean).join('\n\n') };
		const refusal = await newTaskRefusal(locals.supabase, project.id, change);
		if (refusal !== null) return fail(400, { message: refusal });
		const similar = await similarTasksFailure(locals.supabase, project.id, change, formData);
		if (similar !== null) return similar;
		const raised = withRaiserAutocomplete(change, await isStaffMember(locals));
		await createTask(locals.supabase, project.id, raised, user.id);
		return { message: `Raised “${change.title}” on ${project.name}'s backlog.` };
	}
};
