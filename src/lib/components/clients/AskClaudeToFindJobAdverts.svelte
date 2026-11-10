<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import { jobAdvertRequest, type CompanyToSearchForAdverts } from '$lib/data/jobAdvertRequest';

	let { company }: { company: CompanyToSearchForAdverts } = $props();

	const request = $derived(jobAdvertRequest(company));
	const isOnRegister = $derived(company.clientId !== null);
</script>

<div class="flex flex-col gap-4">
	<p class="text-sm text-chalk/70">
		Your own Claude searches the job boards. Paste this into a chat with your Claude, connected to Your
		Business Today:
	</p>
	<div class="flex flex-wrap items-start gap-3">
		<p class="min-w-0 flex-1 font-mono text-sm text-chalk">{request}</p>
		<CopyTextButton text={request} label="Copy" />
	</div>
	<p class="text-xs text-chalk/50">
		It reads only the UK job boards, never LinkedIn and nothing behind a login, and leaves out any advert
		it cannot be sure is theirs.
		{#if isOnRegister}
			It shows you what it found before the adverts are kept on the company.
		{:else}
			Add the company as a lead to keep its adverts on the register.
		{/if}
	</p>
</div>
