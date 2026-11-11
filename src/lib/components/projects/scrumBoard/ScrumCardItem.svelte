<script lang="ts">
	import LifecycleBadgeChip from '$lib/components/lifecycle/LifecycleBadgeChip.svelte';
	import { taskPagePath, taskSheet } from '$lib/client/taskSheet.svelte';
	import { workKindLabels, type ScrumCard } from '$lib/data/scrumBoard';
	import { cardChipClasses, workKindClasses } from './scrumBoardStyles';

	let { card }: { card: ScrumCard } = $props();

	const sheetTarget = $derived({ projectId: card.projectId, taskId: card.id });
	const hasPullRequest = $derived(card.pullRequestUrl !== '');
</script>

<li class="flex flex-col gap-2 rounded-lg border border-hairline bg-night/40 p-3">
	<a
		href={taskPagePath(sheetTarget)}
		onclick={(event) => taskSheet.openOnPlainClick(event, sheetTarget)}
		title={card.title}
		class="line-clamp-3 font-display text-sm leading-snug transition hover:text-go"
	>
		{card.title}
	</a>
	<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
		<span class={[cardChipClasses, workKindClasses[card.workKind]]}>{workKindLabels[card.workKind]}</span>
		<span title="Story points — how big the task is" class={[cardChipClasses, 'border-hairline text-chalk/60']}>
			{card.storyPoints} pts
		</span>
		{#if card.modelLabel !== null}
			<span title="The model it needs" class={[cardChipClasses, 'max-w-40 truncate border-hairline text-chalk/60']}>
				{card.modelLabel}
			</span>
		{/if}
	</div>
	{#if card.lifecycle !== null}
		<LifecycleBadgeChip badge={card.lifecycle} />
	{/if}
	{#if hasPullRequest}
		<a href={card.pullRequestUrl} target="_blank" rel="noopener" class="w-fit font-display text-xs text-go hover:brightness-110">
			Pull request ↗
		</a>
	{/if}
</li>
