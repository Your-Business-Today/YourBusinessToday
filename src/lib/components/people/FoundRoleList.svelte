<script lang="ts">
	import type { PersonFindings } from '$lib/server/people/research/personFindings';

	let { roles }: { roles: PersonFindings['roles'] } = $props();

	function describeRole(role: PersonFindings['roles'][number]): string {
		const position = [role.title, role.organisation].filter(Boolean).join(', ');
		if (role.sourceUrl === '') return position;
		return `${position} (${role.sourceUrl})`;
	}
</script>

<div class="flex flex-col gap-1 text-sm text-chalk/70">
	<p>Roles found</p>
	<ul class="list-disc pl-5 text-chalk/80">
		{#each roles as role (describeRole(role))}
			<li>
				{role.title}{role.organisation === '' ? '' : `, ${role.organisation}`}
				{#if role.sourceUrl !== ''}
					<a href={role.sourceUrl} target="_blank" rel="noreferrer" class="text-xs text-chalk/40 hover:text-signal">source</a>
				{/if}
			</li>
			<input type="hidden" name="roleLine" value={describeRole(role)} />
		{/each}
	</ul>
</div>
