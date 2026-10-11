<script lang="ts">
	import TeamMemberProfile from '../team/TeamMemberProfile.svelte';
	import { teamMembers } from '$lib/data/teamMembers';
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-24">
		<p class="font-display text-sm tracking-widest text-signal uppercase">The team</p>
		<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium md:text-4xl">
			Three partners and no layer between you and them.
		</h2>
		<div class="mt-12 grid gap-10 md:grid-cols-3">
			{#each teamMembers as member (member.id)}
				<TeamMemberProfile {member} />
			{/each}
		</div>
	</div>
</section>
