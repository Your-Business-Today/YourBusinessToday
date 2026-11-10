<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { seatControlFields } from '$lib/data/boardSeatControlForm';
	import { yesOrNo } from '$lib/data/validateSeatControl';
	import type { HeldPieceView } from '$lib/data/boardSeatControlViews';

	let { held }: { held: HeldPieceView } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/answerHeld" use:enhance={tracker.submit()} class="flex flex-col gap-2 border-l-2 border-go pl-3">
	<input type="hidden" name={seatControlFields.heldId} value={held.id} />
	<p class="text-sm font-medium text-chalk">Your Claude asks first. It wants to say ({held.stanceWords}):</p>
	<p class="text-sm break-words whitespace-pre-wrap text-chalk-muted">{held.words}</p>
	<p class="text-xs text-chalk-subtle">Held {held.heldWhen}. Only you see it; nothing is said until you say yes.</p>
	{#if tracker.errorMessage !== null}
		<p class="text-sm font-medium text-signal">{tracker.errorMessage}</p>
	{/if}
	<div class="flex flex-wrap gap-2">
		<Button look="primary" type="submit" name={seatControlFields.answer} value={yesOrNo.yes} isSaving={tracker.isSaving}>Yes, say it</Button>
		<Button type="submit" name={seatControlFields.answer} value={yesOrNo.no} disabled={tracker.isSaving}>No, keep it unsaid</Button>
	</div>
</form>
