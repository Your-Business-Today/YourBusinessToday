<script lang="ts">
	import HeroIllustration from './HeroIllustration.svelte';
</script>

<section class="grid items-center gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
	<div class="flex flex-col gap-5">
		<p class="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-signal uppercase">
			<span class="size-1.5 rounded-full bg-signal"></span>
			Less guesswork. More life.
		</p>
		<h1 class="font-display text-5xl leading-[1.05] font-medium tracking-tight sm:text-6xl lg:text-7xl">
			Your money.<br />
			<span class="bg-linear-to-r from-signal to-go bg-clip-text text-transparent">Made clear.</span>
		</h1>
		<p class="max-w-xl text-lg text-chalk/70">
			Salary, self-employed, or a bit of both. See what you keep — and what to put aside for HMRC — then
			make your next move with confidence.
		</p>
		<ul class="flex flex-wrap gap-2 text-xs text-chalk/70">
			{#each ['No sign-up', 'Updates as you type', 'Rates checked against gov.uk'] as promise (promise)}
				<li class="rounded-full border border-hairline px-3 py-1.5">{promise}</li>
			{/each}
		</ul>
	</div>
	<div class="hidden md:block"><HeroIllustration /></div>
</section>
