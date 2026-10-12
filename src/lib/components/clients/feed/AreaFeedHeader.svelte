<script lang="ts">
	import FeedScopeChips from '$lib/components/feed/FeedScopeChips.svelte';
	import LiveMarker from '$lib/components/feed/LiveMarker.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import { chosenKindOf, chosenScopeOf, kindChoicesFor, scopeChoicesFor, type AreaFeedView } from '$lib/data/areaFeedChoices';
	import { quietButtonClasses } from '$lib/components/site/formStyles';

	let {
		view,
		patches,
		readAt,
		isRefreshing
	}: { view: AreaFeedView; patches: { id: string; name: string }[]; readAt: string; isRefreshing: boolean } = $props();

	const scopeChoices = $derived(scopeChoicesFor(view, patches));
	const kindChoices = $derived(kindChoicesFor(view));
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-2">
			<div class="flex flex-wrap items-center gap-3">
				<PageTitle>What changed on the ground</PageTitle>
				<LiveMarker {readAt} {isRefreshing} />
			</div>
			<p class="text-chalk/70">Every sector searched, business sighted and lead added across the patches, newest first.</p>
		</div>
		<a href="/clients/patches" class={quietButtonClasses}>Patches</a>
	</div>
	<FeedScopeChips scope={chosenScopeOf(view)} choices={scopeChoices} />
	<FeedScopeChips scope={chosenKindOf(view)} choices={kindChoices} />
</div>
