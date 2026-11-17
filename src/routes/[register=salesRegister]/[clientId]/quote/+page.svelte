<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import LeadQuoteDocument from '$lib/components/clients/quote/LeadQuoteDocument.svelte';
	import LeadQuoteVersions from '$lib/components/clients/quote/LeadQuoteVersions.svelte';
	import NoLeadQuote from '$lib/components/clients/quote/NoLeadQuote.svelte';
	import PrintOnPaper from '$lib/components/workspace/PrintOnPaper.svelte';
	import LeadWorkspaceHeader from '$lib/components/clients/leadTabs/LeadWorkspaceHeader.svelte';
	import { leadTabHref, leadTabKeys } from '$lib/components/clients/leadTabs/leadTabs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { client, quote, versions } = $derived(data);
	const quotePath = $derived(leadTabHref(client, leadTabKeys.quote));
	const printOrSave = () => window.print();
</script>

<svelte:head>
	<title>Quote — {client.name} — Your Business Today</title>
</svelte:head>

<PrintOnPaper>
	<div class="print:hidden">
		<LeadWorkspaceHeader company={client} shownTab={leadTabKeys.quote}>
			{#snippet actions()}
				{#if quote !== null}
					<Button look="primary" onclick={printOrSave}>Print</Button>
				{/if}
			{/snippet}
			<p class="text-sm text-chalk-subtle">The plan going forwards for {client.name}, a stage at a time, with its fees.</p>
		</LeadWorkspaceHeader>
	</div>
	<div class={`${workspaceBodyClasses} print:p-0`}>
		{#if quote === null}
			<NoLeadQuote companyName={client.name} clientId={client.id} />
		{:else}
			<LeadQuoteVersions {versions} shownVersion={quote.version} pathOf={(version) => `${quotePath}?version=${version}`} />
			<DashboardPanel isPadded class="mx-auto w-full max-w-5xl print:max-w-none print:border-0">
				<LeadQuoteDocument companyName={client.name} {quote} />
			</DashboardPanel>
		{/if}
	</div>
</PrintOnPaper>

<style>
	@media print {
		@page {
			size: A4;
			margin: 16mm;
		}
	}
</style>
