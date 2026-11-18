<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { watchedKindLabels, type WatchedThing } from '$lib/data/news/watchListRules';

	let { watchedThing, canKeep }: { watchedThing: WatchedThing; canKeep: boolean } = $props();

	const tracker = new FormTracker();
</script>

<RecordsCell kind="link">{watchedThing.value}</RecordsCell>
<RecordsCell label="Kind">{watchedKindLabels[watchedThing.kind]}</RecordsCell>
<RecordsCell label="Called">{watchedThing.label}</RecordsCell>
<RecordsCell label="Added">{formatBritishDate(watchedThing.addedAt)}</RecordsCell>
{#if canKeep}
	<RecordsCell kind="actions">
		<form method="POST" action="?/removeWatched" use:enhance={tracker.submit()} class="inline-flex">
			<input type="hidden" name="watchedThingId" value={watchedThing.id} />
			<Button type="submit" look="ghost" isSaving={tracker.isSaving} savingLabel="Removing…">Remove</Button>
		</form>
	</RecordsCell>
{/if}
