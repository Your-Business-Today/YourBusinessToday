<script lang="ts">
	import DiscoveryCallForm from '$lib/components/contact/DiscoveryCallForm.svelte';
	import DiscoveryCallThankYou from '$lib/components/contact/DiscoveryCallThankYou.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import { companyDetails } from '$lib/data/companyDetails';
	import { discoveryCallLabel } from '$lib/data/discoveryCall';

	let { form } = $props();

	const isSent = $derived(form?.isSent === true);

	const pageTitle = `${discoveryCallLabel} | Your Business Today`;
	const pageDescription =
		'Tell us a little about your business and when suits you. We email to fix a time for a free call about what you do, where the time goes and whether an app would pay for itself.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/contact" />

<div class="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
	<div class="flex flex-col gap-4">
		<p class="font-display text-sm tracking-widest text-signal uppercase">Free discovery call</p>
		<h1 class="font-display text-4xl leading-tight font-medium">
			Book your free<br />discovery call<span class="text-signal">.</span>
		</h1>
		<p class="max-w-prose text-chalk/70">
			Tell us a little about your business and when suits you, and we email to fix a time. Then we
			talk about what you do, where the time goes and what you wish ran itself, and we tell you
			honestly whether an app would pay for itself. No pitch deck and no fee.
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
			<DiscoveryCallThankYou />
		{/if}
		{#if !isSent}
			<DiscoveryCallForm />
		{/if}
	</div>
</div>
