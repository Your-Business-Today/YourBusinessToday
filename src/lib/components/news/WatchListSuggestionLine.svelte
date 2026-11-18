<script lang="ts">
	import { watchedThingKey } from '$lib/data/news/watchedThingKey';
	import { watchedKindLabels, type WatchedThingGiven } from '$lib/data/news/watchListRules';

	let { suggestion }: { suggestion: WatchedThingGiven } = $props();

	const hasLabel = $derived(suggestion.label !== '');
</script>

<li>
	<label class="flex items-center gap-3 text-sm text-chalk">
		<input type="checkbox" name="suggestion" value={watchedThingKey(suggestion)} class="accent-go" />
		<span class="text-chalk-faint">{watchedKindLabels[suggestion.kind]}</span>
		{suggestion.value}
		{#if hasLabel}<span class="text-chalk-subtle">{suggestion.label}</span>{/if}
	</label>
</li>
