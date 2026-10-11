<script lang="ts">
	import ContactForm from '$lib/components/contact/ContactForm.svelte';
	import EnquiryThankYou from '$lib/components/contact/EnquiryThankYou.svelte';
	import { companyDetails } from '$lib/data/companyDetails';

	let { form } = $props();

	const isSent = $derived(form?.isSent === true);
</script>

<svelte:head>
	<title>Talk to us | Your Business Today</title>
	<meta
		name="description"
		content="Tell us what you would like to automate. We learn how your business really runs and then automate the work that repeats."
	/>
</svelte:head>

<div class="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
	<div class="flex flex-col gap-4">
		<p class="font-display text-sm tracking-widest text-signal uppercase">Talk to us</p>
		<h1 class="font-display text-4xl leading-tight font-medium">
			Tell us what you would<br />like to automate.
		</h1>
		<p class="max-w-prose text-chalk/70">
			A few lines is enough. What the business does and where the time goes and what you wish
			ran itself. We read every message and reply by email.
		</p>
		<p class="max-w-prose text-chalk/70">
			Prefer email? Write to
			<a
				href={`mailto:${companyDetails.consultingEmail}`}
				class="text-chalk underline underline-offset-4 transition hover:text-signal"
			>
				{companyDetails.consultingEmail}
			</a>
		</p>
	</div>
	<div class="rounded-2xl border border-hairline bg-carriage p-8">
		{#if isSent}
			<EnquiryThankYou />
		{:else}
			<ContactForm />
		{/if}
	</div>
</div>
