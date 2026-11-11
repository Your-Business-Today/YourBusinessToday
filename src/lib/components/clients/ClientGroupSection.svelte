<script lang="ts">
	import GroupUnderForm from './GroupUnderForm.svelte';
	import StagePill from './StagePill.svelte';
	import type { Client } from '$lib/server/clients/clientRecord';
	import type { GroupParent } from '$lib/server/clients/listGroupParents';

	let {
		client,
		parent,
		children,
		parents
	}: { client: Client; parent: Client | null; children: Client[]; parents: GroupParent[] } = $props();

	const otherParents = $derived(parents.filter((candidate) => candidate.id !== client.id));
</script>

<section class="flex flex-col gap-4">
	<h2 class="font-display text-xl">Group</h2>
	{#if children.length > 0}
		<ul class="divide-y divide-hairline rounded-2xl border border-hairline">
			{#each children as child (child.id)}
				<li class="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
					<a href={`/clients/${child.id}`} class="font-display hover:text-signal">{child.name}</a>
					<StagePill stage={child.stage} />
				</li>
			{/each}
		</ul>
	{/if}
	{#if children.length === 0 && parent === null}
		<p class="text-sm text-chalk/50">Stands alone. Put it under a parent to work a group as one client.</p>
		<GroupUnderForm clientId={client.id} parents={otherParents} />
	{/if}
	{#if children.length === 0 && parent !== null}
		<p class="text-sm text-chalk/50">
			One of the companies under <a href={`/clients/${parent.id}`} class="text-chalk hover:text-signal">{parent.name}</a>.
		</p>
	{/if}
</section>
