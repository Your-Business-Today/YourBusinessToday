<script lang="ts">
	import { stepLook } from './sequenceStepLook';
	import type { SequenceStep } from '$lib/data/taskSequence';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { step }: { step: SequenceStep<ProjectTask> } = $props();

	const task = $derived(step.task);
	const look = $derived(stepLook({ ...step, status: task.status }));
	const taskAddress = $derived(`/projects/${task.projectId}/tasks/${task.id}`);
	const titleClasses = $derived(step.isThisTask ? 'text-chalk' : 'text-chalk/70 hover:text-go');
</script>

<li class="flex w-28 shrink-0 flex-col items-center gap-1 text-center">
	<a
		href={taskAddress}
		aria-current={step.isThisTask ? 'step' : undefined}
		class={`grid h-9 w-9 place-items-center rounded-full border font-display text-sm transition ${look.nodeClasses}`}
	>
		{look.mark}
	</a>
	<a
		href={taskAddress}
		title={task.title}
		class={`line-clamp-2 w-full text-xs transition ${titleClasses}`}
	>
		{task.title}
	</a>
	<span class="font-display text-[0.65rem] tracking-widest text-chalk/40 uppercase">{look.caption}</span>
</li>
