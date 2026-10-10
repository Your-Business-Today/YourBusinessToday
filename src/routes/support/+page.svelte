<script lang="ts">
	import SupportTaskTable from '$lib/components/support/SupportTaskTable.svelte';

	let { data } = $props();

	const { tasks } = $derived(data);
</script>

<svelte:head>
	<title>Support — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<h1 class="font-display text-3xl font-medium">Support</h1>
		<p class="text-chalk/70">
			Every support task still waiting on an answer, across the projects you own, newest first. Each closes
			with a resolution the person who raised it reads.
		</p>
	</div>
	{#if tasks.length === 0}
		<p class="rounded-2xl border border-dashed border-hairline p-6 text-chalk/60">
			Nothing is waiting on an answer.
		</p>
	{:else}
		<SupportTaskTable {tasks} />
	{/if}
</div>
