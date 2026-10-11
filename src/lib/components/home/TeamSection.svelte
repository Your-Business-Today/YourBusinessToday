<script lang="ts">
	import TeamMemberProfile from '../team/TeamMemberProfile.svelte';
	import { teamMembers } from '$lib/data/teamMembers';
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-24">
		<p class="font-display text-sm tracking-widest text-signal uppercase">The team</p>
		<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium md:text-5xl">
			The people you meet are the people who do the work.
		</h2>
		<p class="mt-6 max-w-prose text-lg text-chalk/70">
			We are a small firm on purpose. You will not be sold to by one person and handed to
			another. The partner who sits in your office is the one who answers when you call.
		</p>
		<div class="mt-12 grid gap-10 md:grid-cols-3">
			{#each teamMembers as member (member.id)}
				<TeamMemberProfile {member} />
			{/each}
		</div>
		<a
			href="/about"
			class="mt-12 inline-block rounded-full border border-hairline px-6 py-2.5 font-display
				text-sm text-chalk/80 transition hover:border-chalk/40 hover:text-chalk"
		>
			More about us
		</a>
	</div>
</section>
