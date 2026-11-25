<script lang="ts">
	let { ownerName }: { ownerName: string } = $props();
</script>

<section class="flex flex-col gap-3 border border-hairline bg-carriage px-6 py-10 sm:px-10">
	<h2 class="font-display text-lg font-semibold text-chalk">No documents yet</h2>
	<p class="max-w-2xl text-sm text-chalk-muted">
		Everyone on {ownerName} reads its documents here, online or downloaded. Add one with the form, or have your Claude
		write it and put it up through the Your Business Today connector. Ask it, for example:
	</p>
	<p class="max-w-2xl border-l-4 border-go bg-carriage-raised px-4 py-3 text-sm text-chalk">
		Write a guide to how {ownerName} works and add it to its documents.
	</p>
</section>
