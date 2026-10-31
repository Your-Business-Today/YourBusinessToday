<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses } from '$lib/components/site/formStyles';
	import { continuityCopyLimits, type ContinuityCopy } from '$lib/data/continuityCopy';
	import { ukClockAt } from '$lib/data/ukClock';

	let { continuityCopy }: { continuityCopy: ContinuityCopy } = $props();

	const today = ukClockAt(new Date()).date;
</script>

<section class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<h2 class="font-display text-xl">Continuity copy</h2>
		<p class="text-sm text-chalk/50">
			Schedule 4 section 5.2: the client's portal writes a copy of their system to storage they own every month.
			Record the day their storage was connected, and the day they confirmed they opened a copy.
		</p>
	</div>
	<form method="POST" action="?/recordContinuityCopy" class="flex flex-col gap-4">
		<div class="grid gap-4 sm:grid-cols-3">
			<FormField label="Storage connected on">
				<input type="date" name="storageConnectedOn" value={continuityCopy.storageConnectedOn ?? ''} max={today} class={inputClasses} />
			</FormField>
			<FormField label="Copy opened on">
				<input type="date" name="copyOpenedOn" value={continuityCopy.copyOpenedOn ?? ''} max={today} class={inputClasses} />
			</FormField>
			<FormField label="Confirmed by, at the client">
				<input
					name="copyConfirmedBy"
					value={continuityCopy.copyConfirmedBy ?? ''}
					maxlength={continuityCopyLimits.longestConfirmedBy}
					class={inputClasses}
				/>
			</FormField>
		</div>
		<div class="flex justify-end">
			<SubmitButton>Save continuity copy</SubmitButton>
		</div>
	</form>
</section>
