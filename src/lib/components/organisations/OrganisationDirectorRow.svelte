<script lang="ts">
	import { enhance } from '$app/forms';
	import PersonInitials from '$lib/components/workspace/PersonInitials.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { BoardroomDirector } from '$lib/data/boardroomDirector';

	let { director, canName }: { director: BoardroomDirector; canName: boolean } = $props();

	const tracker = new FormTracker();
</script>

<li class="flex items-center gap-3 px-4 py-2">
	<PersonInitials name={director.name} />
	<span class="flex min-w-0 flex-1 flex-col">
		<span class="truncate font-display text-sm">{director.name}</span>
		<span class="truncate text-xs text-chalk/50">Director since {formatBritishDate(director.namedAt)}</span>
	</span>
	{#if canName && director.accountId !== null}
		<form method="POST" action="?/setDirector" use:enhance={tracker.submit()}>
			<input type="hidden" name="accountId" value={director.accountId} />
			<input type="hidden" name="isDirector" value="false" />
			<button
				type="submit"
				disabled={tracker.isSaving}
				class="shrink-0 rounded-full border border-hairline px-2.5 py-0.5 font-display text-xs text-chalk/60 transition hover:border-signal hover:text-signal disabled:opacity-60"
			>
				Stand down
			</button>
		</form>
	{/if}
</li>
