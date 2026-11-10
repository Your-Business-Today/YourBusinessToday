<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import { personResearchRequest, type PersonToResearch } from '$lib/data/personResearchRequest';

	let { person }: { person: PersonToResearch } = $props();

	const request = $derived(personResearchRequest(person));
</script>

<div class="flex flex-col gap-4">
	<p class="text-sm text-chalk/70">
		Your own Claude does the reading. Paste this into a chat with your Claude, connected to Your
		Business Today:
	</p>
	<div class="flex flex-wrap items-start gap-3">
		<p class="min-w-0 flex-1 font-mono text-sm text-chalk">{request}</p>
		<CopyTextButton text={request} label="Copy" />
	</div>
	<p class="text-xs text-chalk/50">
		It reads their public business presence only, nothing behind a login and nothing of their
		private life, and records the page each finding came from. It shows you what it found before
		anything is saved to their notes, links and companies.
	</p>
</div>
