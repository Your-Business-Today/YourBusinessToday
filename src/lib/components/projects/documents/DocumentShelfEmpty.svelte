<script lang="ts">
	let { projectName }: { projectName: string } = $props();
</script>

<section class="flex flex-col gap-3 border border-hairline bg-carriage px-6 py-10 sm:px-10">
	<h2 class="font-display text-lg font-semibold text-chalk">No documents yet</h2>
	<p class="max-w-2xl text-sm text-chalk-muted">
		Everyone on {projectName} reads its documents here, online or downloaded. Your Claude writes them and puts them up
		through the Your Business Today connector. Ask it, for example:
	</p>
	<p class="max-w-2xl border-l-4 border-go bg-carriage-raised px-4 py-3 text-sm text-chalk">
		Write a guide to how {projectName} works and add it to the project's documents.
	</p>
</section>
