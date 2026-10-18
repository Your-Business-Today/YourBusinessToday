<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import { summariseEventDetail } from '$lib/data/eventDetailSummary';
	import { clientEventLabels } from '$lib/data/clientEventLabels';
	import type { ClientEvent } from '$lib/server/clients/clientEventRecord';

	let { events }: { events: ClientEvent[] } = $props();

</script>

<ol class="flex flex-col gap-2 text-sm">
	{#each events as event (event.id)}
		<li class="flex flex-wrap gap-x-3 text-chalk/60">
			<span class="text-chalk/40">{formatBritishDate(event.createdAt)}</span>
			<span class="text-chalk">{clientEventLabels[event.kind]}</span>
			<span>{summariseEventDetail(event.detail)}</span>
		</li>
	{/each}
</ol>
