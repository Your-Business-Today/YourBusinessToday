import { getLifecycleSteps } from '$lib/server/lifecycle/getLifecycleSteps';
import { lifecycleLines } from './describeLifecycle';
import { lifecycleStepFields, readLifecycleStepFields, subjectFields } from './lifecycleFields';
import { noSuchSubject, resolveSubject } from './resolveSubject';
import { objectSchema } from '../actionTypes';
import { recordLifecycleStep } from '$lib/server/lifecycle/recordLifecycleStep';
import { validateLifecycleStep } from '$lib/data/validateLifecycleStep';
import type { McpAction } from '../actionTypes';

export const lifecycleActions: McpAction[] = [
	{
		name: 'record_lifecycle_step',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary:
			'record a step an AI took on a goal or a task — considering, considered, building, built, ' +
			'reviewing, pull request open, merged or released',
		guidance:
			'Every AI records each step it takes on a goal or task, so any other AI looking over the ' +
			'board knows where the work stands and does not duplicate it. Considering comes first, ' +
			'before anything else is touched; considered carries its outcome (buildable, waiting on a ' +
			'person, needs splitting, needs an infrastructure change); built, reviewing and pull ' +
			'request open carry the branch; released gives the work up. GitHub records the pull ' +
			'request opening and its merge by itself.',
		inputSchema: objectSchema(lifecycleStepFields, ['step', 'agent']),
		run: async (caller, input) => {
			const resolved = await resolveSubject(caller, input);
			if (resolved === null) return noSuchSubject;
			const step = validateLifecycleStep(readLifecycleStepFields(input));
			if (typeof step === 'string') return step;
			await recordLifecycleStep(caller.supabase, resolved.projectId, resolved.subject, step);
			return `Recorded on "${resolved.title}": ${step.step} by ${step.agent}.`;
		}
	},
	{
		name: 'read_lifecycle',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary:
			'every step AIs have taken on one goal or task, oldest first, with which AI and model took each',
		inputSchema: objectSchema(subjectFields),
		run: async (caller, input) => {
			const resolved = await resolveSubject(caller, input);
			if (resolved === null) return noSuchSubject;
			const steps = await getLifecycleSteps(caller.supabase, resolved.subject);
			return [`"${resolved.title}"`, ...lifecycleLines(steps)].join('\n');
		}
	}
];
