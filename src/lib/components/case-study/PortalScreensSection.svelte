<script lang="ts">
	import PortalScreenCard from './PortalScreenCard.svelte';
	import { constructionPortalScreens, demoPortalUrl } from '$lib/data/portalScreens';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">The portal</p>
	<h2 class="mt-5 font-display text-3xl leading-tight font-medium md:text-4xl">
		What the team see when they open it.
	</h2>
	<p class="mt-6 max-w-3xl text-chalk/70">
		These are screens from the construction company's portal. They are taken from its demo copy,
		so every name, address and figure is invented, but the screens are the ones the team work in.
	</p>
	<div class="mt-12 grid gap-12 md:grid-cols-2">
		{#each constructionPortalScreens as screen (screen.id)}
			<PortalScreenCard {screen} />
		{/each}
	</div>
	<div class="mt-12 flex flex-wrap items-center gap-6">
		<a
			href={demoPortalUrl}
			class="rounded-full border border-signal/60 px-6 py-2.5 font-display text-sm text-signal
				transition hover:bg-signal hover:text-night"
		>
			Look around the demo portal
		</a>
		<a
			href="/demo"
			class="font-display text-sm text-chalk/50 underline-offset-4 transition hover:text-chalk
				hover:underline"
		>
			Try one with your own Claude
		</a>
	</div>
</section>
