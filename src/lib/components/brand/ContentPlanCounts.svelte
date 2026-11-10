<script lang="ts">
	import StatTile from '$lib/components/workspace/StatTile.svelte';
	import type { PlanCounts } from '$lib/brand/plan/planCounts';

	let { counts }: { counts: PlanCounts } = $props();

	const noneLeft = 0;
	const stillToDoTone = $derived(counts.stillToDo === noneLeft ? 'plain' : 'attention');
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
	<StatTile label="Posts planned" value={String(counts.planned)} />
	<StatTile label="Scheduled" value={String(counts.scheduled)} />
	<StatTile label="Posted" value={String(counts.published)} tone="go" />
	<StatTile label="Still to do" value={String(counts.stillToDo)} tone={stillToDoTone} />
</div>
