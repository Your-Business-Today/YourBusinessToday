<script lang="ts">
	import ObservationRow from './ObservationRow.svelte';
	import type { Observation } from '$lib/server/observations/observationRecord';

	let { observations }: { observations: Observation[] } = $props();
</script>

{#if observations.length > 0}
	<section class="flex flex-col gap-3">
		<h2 class="font-display text-lg">Observed on the web</h2>
		<ul class="divide-y divide-hairline rounded-2xl border border-hairline">
			{#each observations as observation (observation.id)}
				<ObservationRow {observation} />
			{/each}
		</ul>
	</section>
{/if}
