<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import ContentStageBadge from './ContentStageBadge.svelte';
	import { channelListClasses, extraPost } from './contentPlanPageWords';
	import type { PlanEntry } from '$lib/brand/plan/contentPlan';

	let { channels }: { channels: PlanEntry[] } = $props();
</script>

<ul class={channelListClasses}>
	{#each channels as channel (channel.id)}
		<li><ContentStageBadge stage={channel.stage} />{#if channel.isExtra} <Badge label={extraPost} />{/if}</li>
	{/each}
</ul>
