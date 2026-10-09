<script lang="ts">
	import DisciplineRow from './DisciplineRow.svelte';
	import { consultancyDisciplines } from '$lib/data/consultancyDisciplines';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">What we do</p>
	<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium md:text-5xl">
		Building you tools which will grow with AI.
	</h2>
	<div class="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
		<p class="text-lg text-chalk/70">
			We use our custom tools to analyse your business, identifying the areas in which our
			solutions will have the greatest impact. Your bespoke framework gives you immediate power
			to implement tailored AI solutions that have tangible results.
		</p>
		<p class="text-lg text-chalk/70">
			We build your automation platform in parallel with the running of existing systems to
			ensure a seamless transition of all processes to their AI upgrade.
		</p>
	</div>
	<div class="mt-14 border-t border-hairline md:mt-16">
		{#each consultancyDisciplines as discipline (discipline.id)}
			<DisciplineRow {discipline} />
		{/each}
	</div>
	<a
		href="/vision"
		class="mt-10 inline-block rounded-full border border-hairline px-6 py-2.5 font-display text-sm
			text-chalk/80 transition hover:border-chalk/40 hover:text-chalk"
	>
		Why we build it this way
	</a>
</section>
