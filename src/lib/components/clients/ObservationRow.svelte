<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import { observationKindLabels } from '$lib/data/observationRules';
	import type { Observation } from '$lib/server/observations/observationRecord';

	let { observation }: { observation: Observation } = $props();
</script>

<li class="flex flex-col gap-0.5 px-5 py-3 text-sm">
	<p class="text-chalk/90">{observation.headline}</p>
	<a href={observation.sourceUrl} target="_blank" rel="noreferrer" class="text-xs text-chalk/50 hover:text-signal">
		{observationKindLabels[observation.kind]}, {formatBritishDate(observation.observedAt)}
	</a>
</li>
