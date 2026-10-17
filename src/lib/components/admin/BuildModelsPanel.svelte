<script lang="ts">
	import BuildModelRow from './BuildModelRow.svelte';
	import ReviewModelForm from './ReviewModelForm.svelte';
	import { uncoveredPoints, type BuildModel, type BuildModelSettings } from '$lib/data/buildModels';

	let { settings }: { settings: BuildModelSettings } = $props();

	const blankModel: BuildModel = { modelId: '', label: '', runsOn: '', leastPoints: 1, mostPoints: 1 };
	const gaps = $derived(uncoveredPoints(settings.models));
</script>

<section class="flex flex-col gap-4 rounded-2xl border border-hairline p-5">
	<div class="flex flex-col gap-1">
		<h2 class="font-display text-lg font-medium">Build models</h2>
		<p class="text-sm text-chalk/60">
			The models that build coding tasks, each taking the story points in its range, and the one
			that reviews what the local model builds. The desktop app and the review skill read these.
		</p>
	</div>
	<ReviewModelForm {settings} />
	<ul class="flex flex-col divide-y divide-hairline">
		{#each settings.models as model (model.modelId)}
			<BuildModelRow {model} />
		{/each}
		<BuildModelRow model={blankModel} isNew />
	</ul>
	{#if gaps.length > 0}
		<p class="text-sm text-caution">No model takes {gaps.join(', ')} points yet.</p>
	{/if}
</section>
