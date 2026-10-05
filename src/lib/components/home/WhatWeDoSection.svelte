<script lang="ts">
	import DisciplineRow from './DisciplineRow.svelte';
	import { consultancyDisciplines } from '$lib/data/consultancyDisciplines';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">What we do</p>
	<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium md:text-5xl">
		Most consultancies leave a report. We leave a business that runs itself.
	</h2>
	<p class="mt-5 font-display text-xl leading-relaxed text-chalk/90 md:text-2xl">
		Building you tools which will grow with AI.
	</p>
	<div class="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
		<p class="text-lg text-chalk/70">
			We are brought in when a business has outgrown the way it has always been run: when the
			same job is typed into three places, when nobody can say what state a project is really
			at, and when the few people holding it together can never take a week off.
		</p>
		<p class="text-lg text-chalk/70">
			We analyse your business to identify the key data inputs and outputs. We define the range of
			business processes your company works on and begin to automate within the bespoke framework
			we create for you. We automate the parallel running of systems to ensure a seamless
			transition of all processes to their AI upgrade.
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
