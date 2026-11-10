<script lang="ts">
	import type { BoardContributionView } from '$lib/data/boardRoomViews';

	let { contribution }: { contribution: BoardContributionView } = $props();

	const heading = $derived(`${contribution.number}. ${contribution.speakerName}, round ${contribution.round}${contribution.correction}`);
</script>

<li class="flex flex-col gap-1 border-l-2 border-hairline-strong pl-3">
	<p class="text-sm font-medium break-words text-chalk">{heading}: {contribution.stanceWords}</p>
	<p class="text-sm break-words whitespace-pre-wrap text-chalk-muted">{contribution.words}</p>
	<p class="text-xs text-chalk-subtle">{contribution.when}</p>
</li>
