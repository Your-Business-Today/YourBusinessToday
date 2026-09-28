<script lang="ts">
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let {
		goal,
		projectId,
		taskCountLabel,
		isOpen,
		panelId,
		onToggle
	}: {
		goal: Goal | null;
		projectId: string;
		taskCountLabel: string;
		isOpen: boolean;
		panelId: string;
		onToggle: () => void;
	} = $props();

	const badgeClasses = $derived(
		goal === null ? 'border-hairline text-chalk/50' : 'border-go/40 bg-go/10 text-go'
	);
	const groupTitle = $derived(goal?.title ?? 'Other tasks');
	const toggleLabel = $derived(isOpen ? 'Hide the tasks' : 'Show the tasks');
</script>

<header
	class="flex items-center gap-2 border-hairline bg-night/50 px-2 py-2 sm:px-3"
	class:border-b={isOpen}
>
	<button
		type="button"
		onclick={onToggle}
		title={toggleLabel}
		aria-expanded={isOpen}
		aria-controls={panelId}
		class="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition
			hover:bg-carriage/60"
	>
		<span class="shrink-0 text-chalk/40">
			<ChevronIcon {isOpen} />
		</span>
		<span
			class={`shrink-0 rounded-full border px-2.5 py-0.5 font-display text-xs whitespace-nowrap
				${badgeClasses}`}
		>
			{goal === null ? 'No goal' : 'Goal'}
		</span>
		<span class="truncate font-display font-medium">{groupTitle}</span>
		<span class="ml-auto shrink-0 font-display text-xs whitespace-nowrap text-chalk/50">
			{taskCountLabel}
		</span>
	</button>
	{#if goal !== null}
		<a
			href={`/projects/${projectId}/goals/${goal.id}`}
			title="Open the goal"
			aria-label={`Open the goal ${goal.title}`}
			class="shrink-0 rounded-full border border-hairline px-2.5 py-1 font-display text-xs
				text-chalk/50 transition hover:border-go hover:text-go"
		>
			→
		</a>
	{/if}
</header>
