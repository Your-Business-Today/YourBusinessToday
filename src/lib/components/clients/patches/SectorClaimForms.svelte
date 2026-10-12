<script lang="ts">
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses, quietButtonClasses } from '$lib/components/site/formStyles';

	let {
		patchId,
		sector,
		isClaimed,
		actionPrefix = '?/'
	}: { patchId: string; sector: string; isClaimed: boolean; actionPrefix?: string } = $props();
</script>

<div class="flex flex-wrap items-end gap-2">
	{#if isClaimed}
		<form method="POST" action={`${actionPrefix}releaseSector`}>
			<input type="hidden" name="patchId" value={patchId} />
			<input type="hidden" name="sector" value={sector} />
			<SubmitButton class={quietButtonClasses} savingLabel="Releasing…">Release</SubmitButton>
		</form>
	{:else}
		<form method="POST" action={`${actionPrefix}claimSector`}>
			<input type="hidden" name="patchId" value={patchId} />
			<input type="hidden" name="sector" value={sector} />
			<SubmitButton class={quietButtonClasses} savingLabel="Claiming…">Claim</SubmitButton>
		</form>
	{/if}
	<form method="POST" action={`${actionPrefix}handSectorTo`} class="flex items-end gap-2">
		<input type="hidden" name="patchId" value={patchId} />
		<input type="hidden" name="sector" value={sector} />
		<input name="email" type="email" required placeholder="colleague@yourbusiness.today" aria-label="Hand to" class={inputClasses} />
		<SubmitButton class={quietButtonClasses} savingLabel="Handing…">Hand to</SubmitButton>
	</form>
</div>
