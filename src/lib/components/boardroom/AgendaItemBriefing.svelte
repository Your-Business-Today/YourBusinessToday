<script lang="ts">
	import BoardBriefForm from './BoardBriefForm.svelte';
	import OwnBriefSummary from './OwnBriefSummary.svelte';
	import type { ItemBriefingView } from '$lib/data/boardBriefViews';

	let { itemNumber, briefing }: { itemNumber: number; briefing: ItemBriefingView } = $props();

	const ownBrief = $derived(briefing.ownBrief);
	const briefedWords = $derived(briefing.briefedNames.join(', ') || 'nobody yet');
	const awaitedWords = $derived(briefing.awaitedNames.join(', '));
	const formTitle = $derived(ownBrief === null ? 'Brief your Claude on this item' : 'Change your brief');
</script>

<div class="flex flex-col gap-3">
	<p class="text-xs text-chalk-subtle">
		Briefs in: {briefedWords}.
		{#if awaitedWords !== ''}
			Not yet: {awaitedWords}.
		{/if}
	</p>
	{#if ownBrief !== null}
		<OwnBriefSummary brief={ownBrief} />
	{/if}
	{#if briefing.canBrief}
		<details>
			<summary class="cursor-pointer text-sm font-medium text-chalk hover:text-go">{formTitle}</summary>
			<div class="mt-3">
				<BoardBriefForm {itemNumber} {ownBrief} />
			</div>
		</details>
	{/if}
</div>
