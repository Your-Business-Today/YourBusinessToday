<script lang="ts">
	import AskClaudeToFindJobAdverts from './AskClaudeToFindJobAdverts.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import type { CompanyToSearchForAdverts } from '$lib/data/jobAdvertRequest';

	let { company }: { company: CompanyToSearchForAdverts } = $props();

	let isOpen = $state(false);
</script>

<button type="button" class={quietButtonClasses} onclick={() => (isOpen = true)}>
	Ask your Claude to find its job adverts
</button>

<Modal title="Find the job adverts with your Claude" bind:isOpen maxWidthClass="max-w-2xl">
	<AskClaudeToFindJobAdverts {company} />
</Modal>
