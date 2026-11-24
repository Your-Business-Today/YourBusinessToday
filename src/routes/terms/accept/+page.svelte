<script lang="ts">
	import { primaryButtonClasses, quietButtonClasses } from '$lib/components/account/accountFormStyles';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import LegalSections from '$lib/components/site/LegalSections.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import { termsSoftwareSections } from '$lib/data/legal/termsSoftwareSections';
	import { termsAddresses, termsVersionPublishedOn } from '$lib/data/termsVersion';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Accept the terms — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
	<div class="flex flex-col gap-2">
		<PageTitle>Accept the terms to carry on</PageTitle>
		<p class="text-chalk/70">
			Our terms of service changed on {termsVersionPublishedOn}. Please read them and accept them
			before you use the site. The parts that are new are below; the
			<a href={termsAddresses.terms} class="text-chalk underline underline-offset-4">full terms</a>
			are on their own page.
		</p>
	</div>
	<LegalSections sections={termsSoftwareSections} />
	<form method="POST" action="?/accept" class="flex flex-col gap-4">
		<input type="hidden" name="termsVersion" value={data.termsVersion} />
		<input type="hidden" name="then" value={data.returnPath} />
		<label class="flex items-start gap-3 text-chalk/80">
			<input name="hasAgreed" type="checkbox" required class="mt-1" />
			<span>
				I have read and accept the terms of service of {termsVersionPublishedOn}, and I understand
				that what the site generates is my own use of software, not a professional service.
			</span>
		</label>
		<FormErrorNote message={form?.message ?? null} />
		<div class="flex flex-wrap items-center gap-4">
			<button type="submit" class={primaryButtonClasses}>Accept and carry on</button>
			<a href="/" class={quietButtonClasses}>Not now, go to the home page</a>
		</div>
	</form>
	<form method="POST" action="/account?/signOut">
		<button type="submit" class={quietButtonClasses}>Sign out</button>
	</form>
</div>
