<script lang="ts">
	import StatTile from '$lib/components/workspace/StatTile.svelte';
	import type { PlanCounts } from '$lib/brand/plan/planCounts';

	let { counts, awaitingPictureCount }: { counts: PlanCounts; awaitingPictureCount: number } = $props();

	const noneLeft = 0;
	const stillToDoTone = $derived(counts.stillToDo === noneLeft ? 'plain' : 'attention');
	const awaitingPictureTone = $derived(awaitingPictureCount === noneLeft ? 'plain' : 'attention');
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
	<StatTile label="Posts planned" value={String(counts.planned)} />
	<StatTile label="Scheduled" value={String(counts.scheduled)} />
	<StatTile label="Posted" value={String(counts.published)} tone="go" />
	<StatTile label="Still to do" value={String(counts.stillToDo)} tone={stillToDoTone} />
	<StatTile label="Waiting on a picture" value={String(awaitingPictureCount)} tone={awaitingPictureTone} />
</div>
