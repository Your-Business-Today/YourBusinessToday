<script lang="ts">
	import BeforeFirstUseNote from '$lib/components/admin/documents/BeforeFirstUseNote.svelte';
	import ClientDocumentList from '$lib/components/admin/documents/ClientDocumentList.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Client documents — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/admin" class="font-display text-xs text-chalk/50 transition hover:text-chalk">
			← Admin
		</a>
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<PageTitle>Client documents</PageTitle>
			<a
				href="/admin/documents/pack"
				data-sveltekit-reload
				class="rounded-full border border-signal/60 px-5 py-2 font-display text-sm text-signal
					transition hover:bg-signal hover:text-night"
			>
				Download the contract pack
			</a>
		</div>
		<p class="text-chalk/70">
			The contract stack a client signs before we build or host anything for them, and the
			procedures we run while we hold their data. Download a document as Word, fill in the
			bracketed details, and send it for signature.
		</p>
	</div>
	<BeforeFirstUseNote />
	<ClientDocumentList
		heading="The contract stack"
		description="Sent to a client to sign: the MSA once, an Order Form per stage, and the four schedules."
		entries={data.contractDocuments}
	/>
	<ClientDocumentList
		heading="Our procedures"
		description="Kept by us and followed while we hold client data. Share them if a client asks."
		entries={data.procedureDocuments}
	/>
</div>
