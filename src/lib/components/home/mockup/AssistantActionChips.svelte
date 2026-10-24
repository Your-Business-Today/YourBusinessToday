<script lang="ts">
	let { actions }: { actions: string[] } = $props();

	const hasActions = $derived(actions.length > 0);
</script>

{#if hasActions}
	<div class="mt-0.5 flex gap-1">
		{#each actions as action (action)}
			<span class="rounded-full border border-signal/70 px-1.5 py-0.5 text-[0.4rem] text-signal">
				{action}
			</span>
		{/each}
	</div>
{/if}
