<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import LegalSections from '$lib/components/site/LegalSections.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import { termsChangedSections } from '$lib/data/legal/termsChangedSections';
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
			Our terms changed on {termsVersionPublishedOn}. The parts that changed are below; the
			<a href={termsAddresses.terms} class="text-chalk underline underline-offset-4 hover:text-signal">
				full terms
			</a>
			are on their own page. If you have a written agreement with us, it still comes first.
		</p>
	</div>
	<div class="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-carriage">
		<div class="flex max-h-80 flex-col gap-2 overflow-y-auto px-5 py-4">
			<LegalSections sections={termsChangedSections} size="compact" />
		</div>
		<form method="POST" action="?/accept" class="flex flex-col gap-4 border-t border-hairline px-5 py-4">
			<input type="hidden" name="termsVersion" value={data.termsVersion} />
			<input type="hidden" name="then" value={data.returnPath} />
			<label class="flex items-start gap-3 text-sm text-chalk/80">
				<input name="hasAgreed" type="checkbox" required class="mt-0.5 size-4 shrink-0 accent-go" />
				<span>
					I have read and accept the terms of service of {termsVersionPublishedOn}. I understand that what the software
					generates is not professional advice and that I must check it before relying on it.
				</span>
			</label>
			<FormErrorNote message={form?.message ?? null} />
			<Button type="submit" look="primary">Accept and carry on</Button>
		</form>
		<form method="POST" action="/account?/signOut" class="border-t border-hairline px-5 py-3">
			<Button type="submit" look="ghost">Not now (sign out)</Button>
		</form>
	</div>
</div>
