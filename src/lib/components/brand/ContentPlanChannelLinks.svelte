<script lang="ts">
	import { channelListClasses } from './contentPlanPageWords';
	import { contentPiecePathOf } from './brandKitPageWords';
	import type { PlanEntry } from '$lib/brand/plan/contentPlan';

	let { organisationId, channels }: { organisationId: string; channels: PlanEntry[] } = $props();
</script>

<ul class={channelListClasses}>
	{#each channels as channel (channel.id)}
		<li><a href={contentPiecePathOf(organisationId, channel.id)} class="hover:underline">{channel.medium}</a></li>
	{/each}
</ul>
