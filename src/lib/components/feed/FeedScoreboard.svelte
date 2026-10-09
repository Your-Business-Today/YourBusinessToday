<script lang="ts">
	import StatTile from '$lib/components/workspace/StatTile.svelte';
	import type { FeedScore } from '$lib/data/feedScore';

	let { score }: { score: FeedScore } = $props();

	const doneTone = $derived(score.doneCount > 0 ? 'go' : 'plain');
</script>

<div class="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
	<StatTile label="Done today" value={`${score.doneCount}`} caption="tasks finished" tone={doneTone} />
	<StatTile label="Started today" value={`${score.startedCount}`} caption="tasks in progress" />
	<StatTile label="Raised today" value={`${score.raisedCount}`} caption="new tasks" />
	<StatTile label="For review" value={`${score.pullRequestCount}`} caption="pull requests opened today" />
</div>
