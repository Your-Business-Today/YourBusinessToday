<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { DemoBrainNote } from '$lib/data/demo/demoBusiness';

	let { notes }: { notes: DemoBrainNote[] } = $props();
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">A second brain</p>
	<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium">
		What the business has taught its brain.
	</h2>
	<p class="mt-4 max-w-prose text-chalk/70">
		Tell your Claude how you work and it remembers. Whatever you teach it here appears below and
		shapes what it does next.
	</p>
	<ul class="mt-8 flex flex-col gap-3">
		{#each notes as note (note.id)}
			<li class="flex flex-col gap-1 rounded-2xl border border-hairline px-5 py-4">
				<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">
					Learned {formatBritishDate(note.learnedOn)}
				</span>
				<p class="text-chalk/80">{note.note}</p>
			</li>
		{/each}
	</ul>
</section>
