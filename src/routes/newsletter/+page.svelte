<script lang="ts">
	import NewsletterSignUpForm from '$lib/components/newsletter/NewsletterSignUpForm.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import { newsletterName, newsletterPath, newsletterPromise } from '$lib/data/newsletterSignUp';

	let { form } = $props();

	const isSignedUpOnArrival = $derived(form?.isSignedUp === true);
	const pageTitle = `${newsletterName} | Your Business Today`;
</script>

<PageMeta title={pageTitle} description={newsletterPromise} path={newsletterPath} />

<div class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-20 md:py-28">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Free newsletter</p>
	<PageTitle>{newsletterName}<span class="text-signal">.</span></PageTitle>
	<p class="text-lg text-chalk/70">{newsletterPromise}</p>
	<NewsletterSignUpForm {isSignedUpOnArrival} />
</div>
