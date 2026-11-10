<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { actionStandingBadges } from './actionBadges';
	import type { BoardActionView } from '$lib/data/boardActionViews';

	let { action }: { action: BoardActionView } = $props();

	const badge = $derived(actionStandingBadges[action.standing]);
</script>

<li class="flex flex-col gap-0.5">
	<div class="flex flex-wrap items-center gap-2">
		<span class="text-sm break-words text-chalk">{action.what}</span>
		<Badge label={badge.label} tone={badge.tone} />
	</div>
	<p class="text-xs break-words text-chalk-subtle">{action.ownerName}, {action.due}; {action.where}.</p>
	<p class="text-xs break-words text-chalk-muted">{action.standingWords}</p>
</li>
