<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import { summariseEventDetail } from '$lib/data/eventDetailSummary';
	import { clientEventLabels } from '$lib/data/clientEventLabels';
	import type { PersonEvent } from '$lib/server/people/getPersonEventsForClients';

	let { events }: { events: PersonEvent[] } = $props();

</script>

{#if events.length === 0}
	<p class="text-sm text-chalk/50">Nothing recorded yet.</p>
{/if}
<ol class="flex flex-col gap-2 text-sm">
	{#each events as event (event.id)}
		<li class="flex flex-wrap gap-x-3 text-chalk/60">
			<span class="text-chalk/40">{formatBritishDate(event.createdAt)}</span>
			<a href={`/clients/${event.clientId}`} class="text-chalk/80 hover:text-signal">{event.clientName}</a>
			<span class="text-chalk">{clientEventLabels[event.kind]}</span>
			<span>{summariseEventDetail(event.detail)}</span>
		</li>
	{/each}
</ol>
