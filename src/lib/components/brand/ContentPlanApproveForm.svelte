<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import { approvalExplained, approveAllLabelOf } from './contentApprovalWords';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { PieceAsShown } from '$lib/brand/approval/monthApproval';

	let { monthKey, pieces }: { monthKey: string; pieces: PieceAsShown[] } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/approve" use:enhance={tracker.submit()} class="flex flex-col gap-3">
	<p class="text-sm text-chalk-muted">{approvalExplained}</p>
	<input type="hidden" name="month" value={monthKey} />
	{#each pieces as piece (piece.contentPieceId)}
		<input type="hidden" name="contentPieceId" value={piece.contentPieceId} />
		<input type="hidden" name="updatedAt" value={piece.updatedAt} />
	{/each}
	<FormErrorNote message={tracker.errorMessage} />
	<div class="flex justify-end">
		<Button type="submit" look="primary" isSaving={tracker.isSaving}>{approveAllLabelOf(pieces.length)}</Button>
	</div>
</form>
