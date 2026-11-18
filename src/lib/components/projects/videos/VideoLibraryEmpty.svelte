<script lang="ts">
	let { projectName }: { projectName: string } = $props();
</script>

<section class="flex flex-col gap-6 border border-hairline bg-carriage px-6 py-10 sm:px-10">
	<div class="relative flex h-5 items-center" aria-hidden="true">
		<span class="absolute inset-x-0 top-1/2 h-0 -translate-y-1/2 border-t-4 border-dashed border-hairline-strong"></span>
		{#each [0, 1, 2] as stop (stop)}
			<span class="relative mr-24 flex h-5 w-5 items-center justify-center rounded-full border-4 border-hairline-strong bg-carriage sm:mr-48"></span>
		{/each}
	</div>
	<div class="flex max-w-2xl flex-col gap-2">
		<h2 class="font-display text-lg font-semibold text-chalk">No videos on this line yet</h2>
		<p class="text-sm text-chalk-muted">
			Tutorial videos for {projectName} show here, in sections, for everyone on the project to watch. Your Claude makes them and puts them up
			through the Your Business Today connector. Ask it, for example:
		</p>
		<p class="border-l-4 border-go bg-carriage-raised px-4 py-3 text-sm text-chalk">
			“Make a short tutorial video showing how to sign in to {projectName}, and put it in the project’s videos under Getting started.”
		</p>
	</div>
</section>
