<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import PersonLine from '$lib/components/workspace/PersonLine.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { BoardroomDirector } from '$lib/data/boardroomDirector';

	let { director, canName }: { director: BoardroomDirector; canName: boolean } = $props();

	const tracker = new FormTracker();
</script>

<RecordsCell kind="link"><PersonLine name={director.name} /></RecordsCell>
<RecordsCell label="Director since">{formatBritishDate(director.namedAt)}</RecordsCell>
{#if canName}
	<RecordsCell kind="actions">
		{#if director.accountId !== null}
			<form method="POST" action="?/setDirector" use:enhance={tracker.submit()} class="inline-flex">
				<input type="hidden" name="accountId" value={director.accountId} />
				<input type="hidden" name="isDirector" value="false" />
				<Button type="submit" isSaving={tracker.isSaving}>Stand down</Button>
			</form>
		{/if}
	</RecordsCell>
{/if}
