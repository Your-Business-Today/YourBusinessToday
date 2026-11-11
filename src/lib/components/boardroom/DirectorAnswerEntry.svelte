<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import type { BadgeTone } from '$lib/components/site/badgeTones';

	let {
		directorName,
		badge,
		when,
		words
	}: { directorName: string; badge: { label: string; tone: BadgeTone }; when: string; words: string | null } = $props();
</script>

<li class="flex flex-col gap-0.5">
	<div class="flex flex-wrap items-center gap-2">
		<span class="text-sm text-chalk">{directorName}</span>
		<Badge label={badge.label} tone={badge.tone} />
		<span class="text-xs text-chalk-subtle">{when}</span>
	</div>
	{#if words !== null}
		<p class="text-sm break-words whitespace-pre-wrap text-chalk-muted">{words}</p>
	{/if}
</li>
