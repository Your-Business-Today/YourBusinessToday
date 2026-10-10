<script lang="ts">
	import DocumentProse from '$lib/components/admin/documents/DocumentProse.svelte';

	let { data } = $props();

	const { entry } = $derived(data);
</script>

<svelte:head>
	<title>{entry.title} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16 print:py-0">
	<div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
		<a href="/admin/documents" class="font-display text-xs text-chalk/50 transition hover:text-chalk">
			← Client documents
		</a>
		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={() => window.print()}
				class="font-display text-xs text-chalk/60 underline transition hover:text-chalk"
			>
				Print or save as PDF
			</button>
			<a
				href={`/admin/documents/${entry.slug}/download`}
				data-sveltekit-reload
				class="rounded-full border border-signal/60 px-5 py-2 font-display text-sm text-signal
					transition hover:bg-signal hover:text-night"
			>
				Download as Word
			</a>
		</div>
	</div>
	<DocumentProse documentHtml={data.documentHtml} />
</div>
