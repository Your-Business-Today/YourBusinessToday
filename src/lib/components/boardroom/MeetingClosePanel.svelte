<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { boardMinutesFields } from '$lib/data/boardMinutesForm';
	import type { MeetingCloseView } from '$lib/data/boardMinutesViews';

	let { close }: { close: MeetingCloseView } = $props();

	const tracker = new FormTracker();
	const waitingLines = $derived(close.waitingLines);
	const isAnythingWaiting = $derived(waitingLines.length > 0);
</script>

<DashboardPanel title="Close the meeting" isPadded>
	<form method="POST" action="?/closeMeeting" use:enhance={tracker.submit()} class="flex flex-col gap-3">
		<p class="text-sm text-chalk-muted">
			You chair this meeting, so you close it. Closing cannot be undone: nothing more is said in the room, and no director answers a decision.
		</p>
		{#if isAnythingWaiting}
			<p class="text-sm font-medium text-chalk">Still waiting:</p>
			<ul class="flex flex-col gap-1 text-sm break-words text-chalk">
				{#each waitingLines as line (line)}
					<li>{line}</li>
				{/each}
			</ul>
			<label class="flex items-center gap-2 text-sm text-chalk">
				<input type="checkbox" name={boardMinutesFields.closeWithItemsWaiting} class="size-4 accent-go" required />
				Close it with these still waiting
			</label>
		{/if}
		{#if tracker.errorMessage !== null}
			<p class="text-sm font-medium text-signal">{tracker.errorMessage}</p>
		{/if}
		<div>
			<Button look="primary" type="submit" isSaving={tracker.isSaving}>Close the meeting</Button>
		</div>
	</form>
</DashboardPanel>
