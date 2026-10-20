<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { demoBusinessName } from '$lib/data/demo/seed/seedDemoBusiness';

	let { message }: { message: string | null } = $props();

	let isStarting = $state(false);
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Try it yourself</p>
	<h1 class="mt-5 max-w-3xl font-display text-4xl leading-tight font-medium md:text-5xl">
		Run a business through your own Claude. Try it on ours first.
	</h1>
	<div class="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
		<p class="text-lg text-chalk/70">
			{demoBusinessName} is a made-up joinery firm with real-looking problems: work done and
			never invoiced, invoices past due, quotes gone quiet, two cards paying for the same thing.
			Connect your own Claude to it and ask what you would ask about your own business.
		</p>
		<p class="text-lg text-chalk/70">
			Everyone opens the same link, and each person gets their own private copy that starts
			fresh. What you change is yours alone, and nothing here reaches a real business. Start
			again whenever you like.
		</p>
	</div>
	<form method="POST" action="?/start" use:enhance={() => {
		isStarting = true;
		return async ({ update }) => {
			await update();
			isStarting = false;
		};
	}} class="mt-10 flex flex-col items-start gap-3">
		<SubmitButton isSaving={isStarting} savingLabel="Starting your copy…">
			Start your private demo
		</SubmitButton>
		<FormErrorNote {message} />
	</form>
</section>
