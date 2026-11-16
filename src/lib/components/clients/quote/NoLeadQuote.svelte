<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import { noQuoteWords } from './leadQuoteWords';

	let { companyName, clientId }: { companyName: string; clientId: string } = $props();

	const words = $derived(noQuoteWords(companyName, clientId));
</script>

<div class="flex flex-col items-center gap-3">
	<EmptyState message={words.message} />
	<CopyTextButton text={words.prompt} label="Copy the prompt for your Claude" />
</div>
