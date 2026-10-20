<script lang="ts">
	let { questions }: { questions: string[] } = $props();
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-24">
		<p class="font-display text-sm tracking-widest text-signal uppercase">Things to ask</p>
		<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium">
			Ask your Claude, in your own words.
		</h2>
		<ul class="mt-8 grid gap-3 md:grid-cols-2">
			{#each questions as question (question)}
				<li class="rounded-2xl border border-hairline px-5 py-4 text-chalk/80">“{question}”</li>
			{/each}
		</ul>
	</div>
</section>
