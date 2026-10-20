<script lang="ts">
	import { demoPromises } from '$lib/data/demo/demoPage';
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-24">
		<p class="font-display text-sm tracking-widest text-signal uppercase">What you will see</p>
		<div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each demoPromises as promise (promise.title)}
				<div class="flex flex-col gap-2 rounded-2xl border border-hairline p-5">
					<h3 class="font-display text-xl font-medium">{promise.title}</h3>
					<p class="text-chalk/70">{promise.sentence}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
