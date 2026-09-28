<script lang="ts">
	import ProseText from '$lib/components/site/ProseText.svelte';
	import GoalStatusPill from './GoalStatusPill.svelte';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let { goal, onEdit }: { goal: Goal; onEdit: () => void } = $props();
</script>

<section class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex flex-wrap gap-6">
			<div class="flex flex-col gap-1">
				<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">Status</span>
				<GoalStatusPill status={goal.status} />
			</div>
			<div class="flex flex-col gap-1">
				<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">Priority</span>
				<span class="font-display text-sm">{goal.priority}</span>
			</div>
		</div>
		<button
			type="button"
			onclick={onEdit}
			class="rounded-full bg-go px-6 py-2 font-display text-sm font-medium text-night transition
				hover:brightness-110"
		>
			Edit goal
		</button>
	</div>
	<div class="flex flex-col gap-1">
		<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">Measure</span>
		{#if goal.measure === ''}
			<p class="text-sm text-chalk/50">No measure written yet — how will we know it is met?</p>
		{:else}
			<ProseText text={goal.measure} class="text-sm text-chalk/80" />
		{/if}
	</div>
</section>
