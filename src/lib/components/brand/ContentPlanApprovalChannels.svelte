<script lang="ts">
	import { askForChange, noCaptionYet } from './contentApprovalWords';
	import { channelListClasses } from './contentPlanPageWords';
	import { contentPiecePathOf } from './brandKitPageWords';
	import type { PlanEntry } from '$lib/brand/plan/contentPlan';

	let { organisationId, channels }: { organisationId: string; channels: PlanEntry[] } = $props();
</script>

<ul class={channelListClasses}>
	{#each channels as channel (channel.id)}
		<li class="flex flex-col gap-1">
			<span class="font-semibold text-chalk">{channel.medium}</span>
			<span class="whitespace-pre-line break-words text-chalk-muted">{channel.caption || noCaptionYet}</span>
			<a href={contentPiecePathOf(organisationId, channel.id)} class="text-sm hover:underline">{askForChange}</a>
		</li>
	{/each}
</ul>
