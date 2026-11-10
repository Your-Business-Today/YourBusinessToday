<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import { personApproachRequest } from '$lib/data/personApproachRequest';
	import type { PersonToResearch } from '$lib/data/personResearchRequest';

	let { person }: { person: PersonToResearch } = $props();

	const request = $derived(personApproachRequest(person));
</script>

<div class="flex flex-col gap-4">
	<p class="text-sm text-chalk/70">
		Your own Claude writes the draft. Paste this into a chat with your Claude, connected to Your
		Business Today:
	</p>
	<div class="flex flex-wrap items-start gap-3">
		<p class="min-w-0 flex-1 font-mono text-sm text-chalk">{request}</p>
		<CopyTextButton text={request} label="Copy" />
	</div>
	<p class="text-xs text-chalk/50">
		It drafts an opening message and a call plan from every company they hold, their notes and
		the research, and never invents a fact about them. It shows you the draft to edit before it is
		saved to their notes.
	</p>
</div>
