<script lang="ts">
	import TaskReferenceLink from '$lib/components/projects/TaskReferenceLink.svelte';
	import { stepLook } from './sequenceStepLook';
	import type { SequenceStep } from '$lib/data/taskSequence';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { step }: { step: SequenceStep<ProjectTask> } = $props();

	const task = $derived(step.task);
	const look = $derived(stepLook({ ...step, status: task.status }));
	const reference = $derived({ projectId: task.projectId, taskId: task.id, department: task.department });
	const titleClasses = $derived(step.isThisTask ? 'text-chalk' : 'text-chalk/70 hover:text-go');
</script>

<li class="flex w-28 shrink-0 flex-col items-center gap-1 text-center">
	<TaskReferenceLink
		{reference}
		aria-current={step.isThisTask ? 'step' : undefined}
		class={`grid h-9 w-9 place-items-center rounded-full border font-display text-sm transition ${look.nodeClasses}`}
	>
		{look.mark}
	</TaskReferenceLink>
	<TaskReferenceLink
		{reference}
		title={task.title}
		class={`line-clamp-2 w-full text-xs transition ${titleClasses}`}
	>
		{task.title}
	</TaskReferenceLink>
	<span class="font-display text-[0.65rem] tracking-widest text-chalk/40 uppercase">{look.caption}</span>
</li>
