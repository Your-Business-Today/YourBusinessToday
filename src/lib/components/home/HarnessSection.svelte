<script lang="ts">
	import HarnessDiagram from '../harness/HarnessDiagram.svelte';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">The harness</p>
	<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium md:text-5xl">
		Your single source of data truth and core business workflow processor.
	</h2>
	<div class="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
		<p class="text-lg text-chalk/70">
			Your business already creates its data. It just creates it in many places. A quoting sheet
			here. A job report there. An inbox and a folder of photographs. The harness is one secure
			place for all of it. Every fact has its place and every value is checked before it goes in.
		</p>
		<p class="text-lg text-chalk/70">
			The processes around it become skills. Your AI assistant reads the harness for what it
			needs. It runs the process and writes the result back. The next process picks it up from
			there. The judgement stays with your people. The repetitive work goes to the assistant.
		</p>
	</div>
	<div class="mt-14">
		<HarnessDiagram />
	</div>
	<a
		href="/case-studies/jewel"
		class="mt-10 inline-block rounded-full border border-hairline px-6 py-2.5 font-display text-sm
			text-chalk/80 transition hover:border-chalk/40 hover:text-chalk"
	>
		See it running in a real business
	</a>
</section>
