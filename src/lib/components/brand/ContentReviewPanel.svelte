<script lang="ts">
	import ContentReviewForm from './ContentReviewForm.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { stageInSentenceOf } from '$lib/brand/content/contentWords';
	import type { ContentStage } from '$lib/brand/content/contentPiece';

	let { stage, isAwaitingApproval, answer }: { stage: ContentStage; isAwaitingApproval: boolean; answer: string | null } = $props();
</script>

<DashboardPanel title="Your review" isPadded>
	{#if answer !== null && !isAwaitingApproval}
		<p role="status" class="mb-3 text-sm text-chalk">{answer}</p>
	{/if}
	{#if isAwaitingApproval}
		<ContentReviewForm />
	{:else}
		<p class="text-sm text-chalk-subtle">
			This piece is {stageInSentenceOf(stage)}. A piece is approved or sent back only while it waits for approval.
		</p>
	{/if}
</DashboardPanel>
