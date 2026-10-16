<script lang="ts">
	import OnboardingSignUpForm from '$lib/components/onboarding/OnboardingSignUpForm.svelte';
</script>

<svelte:head>
	<title>Start onboarding | Your Business Today</title>
	<meta
		name="description"
		content="Sign your business up to Your Business Today and get the one prompt that connects your Claude and maps your business."
	/>
</svelte:head>

<div class="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
	<div class="flex flex-col gap-4">
		<p class="font-display text-sm tracking-widest text-signal uppercase">Start onboarding</p>
		<h1 class="font-display text-4xl leading-tight font-medium">
			Tell us who you are,<br />and your onboarding begins.
		</h1>
		<p class="max-w-prose text-chalk/70">
			Next you connect your own Claude to Your Business Today and paste one prompt. Your Claude
			maps how your business works from the tools you already use, and asks you before anything is
			written down.
		</p>
	</div>
	<div class="rounded-2xl border border-hairline bg-carriage p-8">
		<OnboardingSignUpForm />
	</div>
</div>
