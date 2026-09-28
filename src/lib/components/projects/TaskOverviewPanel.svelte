<script lang="ts">
	import ProseText from '$lib/components/site/ProseText.svelte';
	import SupportTaskFacts from '$lib/components/support/SupportTaskFacts.svelte';
	import TaskDueDate from './TaskDueDate.svelte';
	import { taskStatusLabelFor } from '$lib/data/taskKind';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		task,
		goalTitle,
		assigneeNames,
		raisedByName,
		onEdit
	}: {
		task: ProjectTask;
		goalTitle: string | null;
		assigneeNames: string[];
		raisedByName: string;
		onEdit: () => void;
	} = $props();

	const isDone = $derived(task.status === 'done');
	const storySentence = $derived(
		task.isUserStory && task.storyRole !== ''
			? `As a ${task.storyRole}, I want ${task.storyWant}, so that ${task.storyBenefit}.`
			: null
	);
	const factClasses = 'flex flex-col gap-1';
	const factLabelClasses = 'font-display text-xs tracking-widest text-chalk/50 uppercase';
</script>

<section class="flex flex-col gap-5 rounded-2xl border border-hairline bg-carriage p-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex flex-wrap gap-x-8 gap-y-4">
			<div class={factClasses}>
				<span class={factLabelClasses}>Status</span>
				<span class="font-display text-sm">{taskStatusLabelFor(task.kind, task.status)}</span>
			</div>
			<div class={factClasses}>
				<span class={factLabelClasses}>Goal</span>
				<span class="font-display text-sm">{goalTitle ?? '—'}</span>
			</div>
			<div class={factClasses}>
				<span class={factLabelClasses}>Due</span>
				{#if task.dueDate !== null}
					<TaskDueDate dueDate={task.dueDate} {isDone} />
				{:else}
					<span class="font-display text-sm text-chalk/50">—</span>
				{/if}
			</div>
			<div class={factClasses}>
				<span class={factLabelClasses}>Priority</span>
				<span class="font-display text-sm">
					{task.priority}{task.globalPriority === null ? '' : ` · queue ${task.globalPriority}`}
				</span>
			</div>
			<div class={factClasses}>
				<span class={factLabelClasses}>Points</span>
				<span class="font-display text-sm">{task.storyPoints}</span>
			</div>
			<div class={factClasses}>
				<span class={factLabelClasses}>Complete</span>
				<span class="font-display text-sm">{task.completionPercent}%</span>
			</div>
			<div class={factClasses}>
				<span class={factLabelClasses}>Assignees</span>
				<span class="font-display text-sm">
					{assigneeNames.length > 0 ? assigneeNames.join(', ') : 'Unassigned'}
				</span>
			</div>
		</div>
		<button
			type="button"
			onclick={onEdit}
			class="rounded-full bg-go px-6 py-2 font-display text-sm font-medium text-night transition
				hover:brightness-110"
		>
			Edit task
		</button>
	</div>
	{#if task.kind === 'support'}
		<SupportTaskFacts {task} {raisedByName} />
	{/if}
	{#if storySentence !== null}
		<p class="rounded-2xl border border-caution/40 bg-caution/10 px-5 py-3 text-sm text-caution">
			{storySentence}
		</p>
	{/if}
	{#if task.details !== ''}
		<ProseText text={task.details} class="text-sm text-chalk/80" />
	{/if}
</section>
