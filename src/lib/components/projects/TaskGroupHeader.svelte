<script lang="ts">
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import { isCurrentGoal } from '$lib/data/goalHorizon';
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

	const badgeClasses = $derived(describeBadgeClasses());
	const badgeLabel = $derived(describeBadge());
	const groupTitle = $derived(goal?.title ?? 'Unassigned tasks');
	const toggleLabel = $derived(isOpen ? 'Hide the tasks' : 'Show the tasks');

	function describeBadge(): string {
		if (goal === null) return 'No goal';
		if (isCurrentGoal(goal)) return 'Goal';
		return 'Long term';
	}

	function describeBadgeClasses(): string {
		if (goal === null) return 'border-hairline text-chalk/50';
		if (isCurrentGoal(goal)) return 'border-go/40 bg-go/10 text-go';
		return 'border-hairline bg-night text-chalk/60';
	}
</script>

<header
	class="flex items-center gap-2 border-hairline bg-night/40 px-2 py-1.5"
	class:border-b={isOpen}
>
	<button
		type="button"
		onclick={onToggle}
		title={toggleLabel}
		aria-expanded={isOpen}
		aria-controls={panelId}
		class="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1 text-left transition
			hover:bg-carriage/60"
	>
		<span class="shrink-0 text-chalk/40">
			<ChevronIcon {isOpen} />
		</span>
		<span
			class={`shrink-0 rounded-full border px-2 py-0.5 font-display text-[0.7rem] whitespace-nowrap
				${badgeClasses}`}
		>
			{badgeLabel}
		</span>
		<span class="truncate font-display text-sm font-medium">{groupTitle}</span>
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
