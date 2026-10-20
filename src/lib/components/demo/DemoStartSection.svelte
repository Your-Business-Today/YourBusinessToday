<script lang="ts">
	import DemoKindChoiceCard from '$lib/components/demo/DemoKindChoiceCard.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import { demoKindChoices } from '$lib/data/demo/demoKindChoices';

	let { message }: { message: string | null } = $props();
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Try it yourself</p>
	<h1 class="mt-5 max-w-3xl font-display text-4xl leading-tight font-medium md:text-5xl">
		Run a business through your own Claude. Try it on ours first.
	</h1>
	<div class="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
		<p class="text-lg text-chalk/70">
			Pick the kind of business closest to yours. You get a made-up one with real-looking
			problems: work done and never invoiced, invoices past due, quotes gone quiet, two cards
			paying for the same thing. Connect your own Claude to it and ask what you would ask
			about your own business.
		</p>
		<p class="text-lg text-chalk/70">
			Everyone opens the same link, and each person gets their own private copy that starts
			fresh. What you change is yours alone, and nothing here reaches a real business. Start
			again whenever you like.
		</p>
	</div>
	<div class="mt-10 grid gap-6 md:grid-cols-2">
		{#each demoKindChoices as choice (choice.kind)}
			<DemoKindChoiceCard {choice} />
		{/each}
	</div>
	<div class="mt-4"><FormErrorNote {message} /></div>
</section>
