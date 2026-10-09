<script lang="ts">
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { primaryButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';

	let {
		canImportOfficers,
		onAddContact
	}: { canImportOfficers: boolean; onAddContact: () => void } = $props();
</script>

<div class="flex flex-wrap gap-2">
	{#if canImportOfficers}
		<form method="POST" action="?/importOfficers">
			<SubmitButton class={quietButtonClasses} savingLabel="Reading the register…">
				Import officers from Companies House
			</SubmitButton>
		</form>
	{/if}
	<button class={primaryButtonClasses} onclick={onAddContact}>Add contact</button>
</div>
