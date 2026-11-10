<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { minutesAnswerBadges } from './minutesBadges';
	import type { MinutesAnswerView } from '$lib/data/boardMinutesViews';

	let { answer }: { answer: MinutesAnswerView } = $props();

	const badge = $derived(minutesAnswerBadges[answer.answer]);
</script>

<li class="flex flex-col gap-0.5">
	<div class="flex flex-wrap items-center gap-2">
		<span class="text-sm text-chalk">{answer.directorName}</span>
		<Badge label={badge.label} tone={badge.tone} />
		<span class="text-xs text-chalk-subtle">{answer.when}</span>
	</div>
	{#if answer.changeWords !== null}
		<p class="text-sm break-words whitespace-pre-wrap text-chalk-muted">{answer.changeWords}</p>
	{/if}
</li>
