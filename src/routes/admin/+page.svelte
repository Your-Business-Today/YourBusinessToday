<script lang="ts">
	import AdminUserRow from '$lib/components/admin/AdminUserRow.svelte';
	import SiteModelPanel from '$lib/components/admin/SiteModelPanel.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Admin — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<div class="flex items-baseline justify-between gap-3">
			<PageTitle>Admin</PageTitle>
			<div class="flex items-baseline gap-4">
				<a
					href="/admin/documents"
					class="font-display text-xs text-chalk/50 underline transition hover:text-chalk"
				>
					Client documents
				</a>
				<a
					href="/admin/usage"
					class="font-display text-xs text-chalk/50 underline transition hover:text-chalk"
				>
					Usage and margin
				</a>
			</div>
		</div>
		<p class="text-chalk/70">
			The model the site runs on, every account, its credit balance, the controls to adjust
			credits, restrict access, or delete an account, and every purchase made through Stripe.
		</p>
	</div>
	{#if form?.message}
		<p class="rounded-2xl border border-go/50 bg-go/10 px-5 py-4 text-go">{form.message}</p>
	{/if}
	<SiteModelPanel siteModel={data.siteModel} />
	<ul class="flex flex-col divide-y divide-hairline rounded-2xl border border-hairline">
		{#each data.users as user (user.email)}
			<AdminUserRow {user} />
		{/each}
	</ul>
</div>
