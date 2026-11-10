<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { deadlinesEmailFields, deadlinesEmailLimits } from '$lib/data/taxCalculator/deadlinesEmailForm';
	import { amountAsFieldValue, estimateFiguresFor } from '$lib/data/taxCalculator/estimateFigures';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import DeadlinesEmailSent from './DeadlinesEmailSent.svelte';
	import WidgetIcon from './WidgetIcon.svelte';
	import { choiceTileClasses, fieldControlClasses, fieldLabelClasses, helperTextClasses, widgetCardClasses } from './calculatorStyles';

	let { estimate }: { estimate: TakeHomeEstimate } = $props();

	const tracker = new FormTracker();
	const rules = $derived(estimate.rules);
	const taxYear = $derived(rules.taxYear);
	const figures = $derived(estimateFiguresFor(estimate));
	let shouldIncludeEstimate = $state(false);
	let isSent = $state(false);
</script>

<article class={widgetCardClasses} aria-labelledby="deadlines-email-heading">
	<WidgetIcon name="calendar" toneClasses="bg-go/15 text-go" />
	<h3 id="deadlines-email-heading" class="font-display text-xl font-medium">Never miss a payment date</h3>
	{#if isSent}
		<DeadlinesEmailSent {taxYear} onSendAnother={() => (isSent = false)} />
	{/if}
	{#if !isSent}
		<p class="text-sm text-chalk/70">
			We’ll email you the {taxYear} deadlines still ahead, with a calendar file that adds each date and a reminder a week
			before.
		</p>
		<form
			method="POST"
			action="?/emailDeadlines"
			use:enhance={tracker.submit(() => (isSent = true), { shouldKeepFields: true })}
			class="relative flex flex-col gap-4"
		>
			<input type="hidden" name={deadlinesEmailFields.taxYear} value={taxYear} />
			<label class="flex flex-col gap-2">
				<span class={fieldLabelClasses}>Your email address</span>
				<input
					name={deadlinesEmailFields.email}
					type="email"
					autocomplete="email"
					required
					maxlength={deadlinesEmailLimits.longestEmail}
					class={`${fieldControlClasses} w-full px-4`}
				/>
			</label>
			<label class={choiceTileClasses}>
				<input type="checkbox" bind:checked={shouldIncludeEstimate} class="size-4 accent-go" />
				Include my estimate in the email
			</label>
			{#if shouldIncludeEstimate}
				<input type="hidden" name={deadlinesEmailFields.takeHome} value={amountAsFieldValue(figures.takeHome)} />
				<input type="hidden" name={deadlinesEmailFields.selfAssessmentBill} value={amountAsFieldValue(figures.selfAssessmentBill)} />
				<input type="hidden" name={deadlinesEmailFields.paymentOnAccount} value={amountAsFieldValue(figures.paymentOnAccount)} />
			{/if}
			<p class={helperTextClasses}>
				We send only your email address and the tax year{shouldIncludeEstimate ? ', with your take-home and tax figures' : ''},
				use the address once to send this email, and do not keep it. Read our
				<a href="/privacy" class="text-chalk underline underline-offset-4 hover:text-signal">privacy statement</a>.
			</p>
			<label class="absolute -left-[9999px] opacity-0" aria-hidden="true">
				Leave this empty
				<input name={deadlinesEmailFields.honeypot} tabindex="-1" autocomplete="off" />
			</label>
			<FormErrorNote message={tracker.errorMessage} />
			<SubmitButton isSaving={tracker.isSaving} savingLabel="Sending…">Email me the deadlines</SubmitButton>
		</form>
	{/if}
</article>
