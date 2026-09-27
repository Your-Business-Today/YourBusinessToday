<script lang="ts">
	import { filterChipClasses } from './filterChipClasses';

	let {
		isWaitingOnMeOnly = $bindable(),
		waitingCount
	}: { isWaitingOnMeOnly: boolean; waitingCount: number } = $props();
</script>

<button
	type="button"
	aria-pressed={isWaitingOnMeOnly}
	onclick={() => (isWaitingOnMeOnly = !isWaitingOnMeOnly)}
	title="Tasks whose conversation is waiting on you or your Claude"
	class={filterChipClasses(isWaitingOnMeOnly)}
>
	Waiting on me
	{#if waitingCount > 0}
		<span class="ml-1 rounded-full bg-signal px-1.5 font-display text-xs text-night">
			{waitingCount}
		</span>
	{/if}
</button>
