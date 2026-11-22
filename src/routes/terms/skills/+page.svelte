<script lang="ts">
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import SkillAreaList from '$lib/components/site/SkillAreaList.svelte';
	import { termsAddresses } from '$lib/data/termsVersion';

	let { data } = $props();
</script>

<svelte:head>
	<title>The skills — Your Business Today</title>
	<meta
		name="description"
		content="Every skill Claude follows on Your Business Today, published in full so you can review what shapes your accounts and everything else the site generates."
	/>
</svelte:head>

<article class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
	<p class="font-display text-sm tracking-widest text-signal uppercase">The small print</p>
	<PageTitle>The skills</PageTitle>
	<p class="text-chalk/80">
		When Claude works on the site for you, it follows these written instructions: what each thing
		it can do does, and how it is to go about it. They are published here in full, exactly as your
		Claude receives them, so that you can review the skills behind anything you rely on, starting
		with your books and accounts.
	</p>
	<p class="text-chalk/80">
		What the site generates is your own use of software, not a professional service, and you are
		responsible for checking it, as our
		<a href={termsAddresses.terms} class="text-chalk underline underline-offset-4">terms</a> say.
	</p>
	{#each data.skillAreas as skillArea, position (skillArea.label)}
		<SkillAreaList {skillArea} isOpen={position === 0} />
	{/each}
</article>
