<script lang="ts">
	import BillingScheduleLineRow from './BillingScheduleLineRow.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import { blankLineDraft, draftTotal, type BillingScheduleDraft } from '$lib/data/books/billingScheduleDraft';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { BillingChoice } from '$lib/data/books/organisationBilling';

	let {
		draft = $bindable(),
		incomeAccounts,
		costCentres
	}: { draft: BillingScheduleDraft; incomeAccounts: BillingChoice[]; costCentres: BillingChoice[] } = $props();

	const fewestLines = 1;
	const total = $derived(draftTotal(draft));
	const lines = $derived(draft.lines);
	const canRemove = $derived(lines.length > fewestLines);
	const firstIncomeAccountId = $derived(incomeAccounts[0]?.id ?? '');

	function addLine() {
		draft.lines = [...lines, blankLineDraft(firstIncomeAccountId)];
	}

	function removeLine(position: number) {
		draft.lines = lines.filter((_line, index) => index !== position);
	}
</script>

<fieldset class="flex flex-col gap-3">
	<legend class="mb-2 font-display text-sm font-semibold text-chalk">Lines on each invoice</legend>
	{#each draft.lines as _line, position (position)}
		<BillingScheduleLineRow
			bind:line={draft.lines[position]}
			lineNumber={position + 1}
			{canRemove}
			{incomeAccounts}
			{costCentres}
			onRemove={() => removeLine(position)}
		/>
	{/each}
	<div class="flex items-center justify-between gap-3">
		<Button onclick={addLine}>Add a line</Button>
		<p class="font-display text-sm text-chalk">Total {total === null ? 'not yet worked out' : formatPoundsAndPence(total)}</p>
	</div>
</fieldset>
