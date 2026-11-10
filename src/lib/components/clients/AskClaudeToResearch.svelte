<script lang="ts">
	import { untrack } from 'svelte';
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import { companyResearchRequest } from '$lib/data/companyResearchRequest';
	import { inputClasses, panelClasses } from '$lib/components/site/formStyles';

	let { query, clientId }: { query: string; clientId: string | null } = $props();

	let companyName = $state(untrack(() => query));

	const request = $derived(companyResearchRequest({ name: companyName.trim(), clientId }));
</script>

<section class={panelClasses}>
	{#if clientId === null}
		<label class="flex flex-col gap-2 text-sm text-chalk/70">
			Company name or website
			<input bind:value={companyName} placeholder="Acme Joinery, or https://acmejoinery.co.uk" class={inputClasses} />
		</label>
	{/if}
	<p class="text-sm text-chalk/70">Paste this into a chat with your Claude, connected to Your Business Today:</p>
	<div class="flex flex-wrap items-start gap-3">
		<p class="min-w-0 flex-1 font-mono text-sm text-chalk">{request}</p>
		<CopyTextButton text={request} label="Copy" />
	</div>
	<p class="text-xs text-chalk/50">
		It reads public business pages only, nothing behind a login, and records the page each fact
		came from. It shows you what it found before anything is saved.
	</p>
</section>
