<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { moneyColumnLimits } from '$lib/data/books/moneyColumn';
	import { pennyStep } from './billingFormChoices';
	import type { BillingLineDraft } from '$lib/data/books/billingScheduleDraft';
	import type { BillingChoice } from '$lib/data/books/organisationBilling';

	let {
		line = $bindable(),
		lineNumber,
		canRemove,
		incomeAccounts,
		costCentres,
		onRemove
	}: {
		line: BillingLineDraft;
		lineNumber: number;
		canRemove: boolean;
		incomeAccounts: BillingChoice[];
		costCentres: BillingChoice[];
		onRemove: () => void;
	} = $props();

	const { largest } = moneyColumnLimits;
</script>

{#snippet choices(options: BillingChoice[])}
	{#each options as option (option.id)}
		<option value={option.id}>{option.label}</option>
	{/each}
{/snippet}

<div class="grid grid-cols-2 items-end gap-3 border-b border-hairline pb-3 md:grid-cols-[2fr_1fr_1fr_1.5fr_1.5fr_auto]">
	<FormField label="What" class="col-span-2 md:col-span-1">
		<input type="text" bind:value={line.description} required />
	</FormField>
	<FormField label="Quantity">
		<input type="number" bind:value={line.quantity} min={pennyStep} max={largest} step={pennyStep} required />
	</FormField>
	<FormField label="Price">
		<input type="number" bind:value={line.unitPrice} min={-largest} max={largest} step={pennyStep} required />
	</FormField>
	<FormField label="Income account">
		<select bind:value={line.incomeAccountId} required>{@render choices(incomeAccounts)}</select>
	</FormField>
	<FormField label="Cost centre">
		<select bind:value={line.costCentreId}>
			<option value="">None</option>
			{@render choices(costCentres)}
		</select>
	</FormField>
	<Button onclick={onRemove} disabled={!canRemove} label={`Remove line ${lineNumber}`}>Remove</Button>
</div>
