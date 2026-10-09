<script lang="ts">
	import SequenceStepNode from './SequenceStepNode.svelte';
	import type { TaskSequence } from '$lib/data/taskSequence';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { sequence }: { sequence: TaskSequence<ProjectTask> } = $props();
</script>

<ol class="flex items-start overflow-x-auto px-4 py-4">
	{#each sequence.steps as step, stepIndex (step.stepNumber)}
		{#if stepIndex > 0}
			<li aria-hidden="true" class="relative mt-[1.1rem] h-0.5 min-w-6 flex-1">
				<span class="absolute inset-0 rounded-full bg-chalk/20"></span>
			</li>
		{/if}
		<SequenceStepNode {step} />
	{/each}
</ol>
