<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import { channelListClasses, moveLabelOf } from './contentPlanPageWords';
	import type { PlanEntry } from '$lib/brand/plan/contentPlan';

	let { channels, onMove }: { channels: PlanEntry[]; onMove: (entry: PlanEntry) => void } = $props();

	const channelCount = $derived(channels.length);
</script>

<ul class={channelListClasses}>
	{#each channels as channel (channel.id)}
		<li>{#if channel.canMove}<Button onclick={() => onMove(channel)}>{moveLabelOf(channel, channelCount)}</Button>{/if}</li>
	{/each}
</ul>
