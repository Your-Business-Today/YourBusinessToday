<script lang="ts">
	import { page } from '$app/state';
	import { primaryButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';

	const notFound = 404;
	const pageError = $derived(page.error);
	const isNotFound = $derived(page.status === notFound);
	const heading = $derived(isNotFound ? 'That page is not here' : 'Something went wrong');
	const explanation = $derived(
		isNotFound
			? 'The link may be out of date, or the page may have moved.'
			: 'The problem has been recorded. If it keeps happening, quote the reference below when you get in touch.'
	);
</script>

<svelte:head>
	<title>{heading} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
	<div class="flex flex-col gap-2">
		<p class="font-display text-xs tracking-widest text-chalk/40 uppercase">{page.status}</p>
		<h1 class="font-display text-3xl font-medium">{heading}</h1>
		<p class="text-chalk/70">{explanation}</p>
	</div>
	{#if !isNotFound}
		<p role="alert" class="rounded-xl border border-caution/50 bg-caution/10 px-4 py-3 text-sm text-caution">
			{pageError?.message}
		</p>
	{/if}
	<div class="flex flex-wrap gap-3">
		<a href="/" class={primaryButtonClasses}>Go to the home page</a>
		<button type="button" onclick={() => history.back()} class={quietButtonClasses}>Go back</button>
	</div>
</div>
