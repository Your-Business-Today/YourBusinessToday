<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { contentStageLabels } from '$lib/brand/content/contentWords';
	import type { BadgeTone } from '$lib/components/site/badgeTones';
	import type { ContentStage } from '$lib/brand/content/contentPiece';

	let { stage }: { stage: ContentStage } = $props();

	const stageTones: Record<ContentStage, BadgeTone> = {
		idea: 'notStarted',
		drafted: 'neutral',
		awaiting_approval: 'warning',
		approved: 'positive',
		scheduled: 'progress',
		published: 'positive'
	};
</script>

<Badge label={contentStageLabels[stage]} tone={stageTones[stage]} hasDot />
