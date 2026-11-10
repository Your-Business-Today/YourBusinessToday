<script lang="ts">
	import StripeEventsToCheckTable from '$lib/components/admin/StripeEventsToCheckTable.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { data, form } = $props();

	const events = $derived(data.events);
</script>

<svelte:head>
	<title>Stripe payments to check — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/admin" class="font-display text-xs text-chalk/50 underline transition hover:text-chalk">Admin</a>
		<PageTitle>Stripe payments to check</PageTitle>
		<p class="text-chalk/70">
			Every payment and refund Stripe reports is posted to the books by itself. Those listed here could not be: the money
			matches no invoice, the books refused it, or posting stopped. Post or refund each by hand in the books or in Stripe,
			then mark it dealt with.
		</p>
	</div>
	{#if form?.message}
		<p class="border border-hairline px-5 py-4 text-chalk">{form.message}</p>
	{/if}
	<DashboardPanel title="To check" count={events.length}>
		<div class="overflow-x-auto">
			<StripeEventsToCheckTable {events} />
		</div>
	</DashboardPanel>
</div>
