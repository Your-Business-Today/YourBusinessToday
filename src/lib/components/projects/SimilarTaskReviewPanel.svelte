<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import SimilarTaskReviewForm from './SimilarTaskReviewForm.svelte';
	import type { SimilarTaskReview } from '$lib/data/similarTaskReview';

	let { reviews }: { reviews: SimilarTaskReview[] } = $props();
</script>

<DashboardPanel title="Raised anyway, like this task">
	<ul class="flex flex-col gap-4 px-4 py-3 text-sm">
		{#each reviews as review (review.id)}
			<li><SimilarTaskReviewForm {review} /></li>
		{/each}
	</ul>
</DashboardPanel>
