<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
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

<div class="mx-auto flex max-w-xl flex-col gap-5 px-4 py-10 sm:px-6">
	<div class="flex flex-col gap-1.5">
		<p class="font-display text-xs tracking-widest text-signal uppercase">
			Terms of service · {termsVersionPublishedOn}
		</p>
		<PageTitle size="compact">Accept the terms to carry on</PageTitle>
		<p class="text-sm text-chalk/60">
			Our terms changed. The new parts are below; the
			<a href={termsAddresses.terms} class="text-chalk underline underline-offset-4 hover:text-signal">
				full terms
			</a>
			are on their own page.
		</p>
	</div>
	<div class="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-carriage">
		<div class="flex max-h-80 flex-col gap-2 overflow-y-auto px-5 py-4">
			<LegalSections sections={termsSoftwareSections} size="compact" />
		</div>
		<form method="POST" action="?/accept" class="flex flex-col gap-4 border-t border-hairline px-5 py-4">
			<input type="hidden" name="termsVersion" value={data.termsVersion} />
			<input type="hidden" name="then" value={data.returnPath} />
			<label class="flex items-start gap-3 text-sm text-chalk/80">
				<input name="hasAgreed" type="checkbox" required class="mt-0.5 size-4 shrink-0 accent-go" />
				<span>
					I have read and accept the terms of service of {termsVersionPublishedOn}, and I understand that what the site
					generates is my own use of software, not a professional service.
				</span>
			</label>
			<FormErrorNote message={form?.message ?? null} />
			<div class="flex flex-wrap items-center gap-2">
				<Button type="submit" look="primary">Accept and carry on</Button>
				<Button href="/" look="ghost">Not now</Button>
			</div>
		</form>
	</div>
	<form method="POST" action="/account?/signOut" class="self-center">
		<Button type="submit" look="ghost">Sign out</Button>
	</form>
</div>
