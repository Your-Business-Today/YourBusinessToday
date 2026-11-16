<script lang="ts">
	import SupportTaskTable from '$lib/components/support/SupportTaskTable.svelte';
	import type { SupportTaskListing } from '$lib/server/support/getOpenSupportTasks';

	let { supportTasks }: { supportTasks: SupportTaskListing[] } = $props();
</script>

<section class="flex flex-col gap-4">
	<h2 class="font-display text-xl">Support</h2>
	{#if supportTasks.length === 0}
		<p class="text-sm text-chalk/50">Nothing raised yet.</p>
	{:else}
		<SupportTaskTable tasks={supportTasks} />
	{/if}
</section>
