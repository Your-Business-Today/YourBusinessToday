<script lang="ts">
	import { isPersonalProject, personalProjectLabel } from '$lib/data/personalProject';

	let { organisationId, organisationName }: { organisationId: string | null; organisationName: string } = $props();

	const badgeClasses =
		'relative z-10 max-w-full truncate rounded-full border border-hairline px-2.5 py-0.5 font-display text-xs text-chalk/60';
</script>

{#if isPersonalProject(organisationId)}
	<span title="Only you and the people you invite are on this project" class={badgeClasses}>
		{personalProjectLabel}
	</span>
{:else if organisationName !== ''}
	<a
		href={`/organisations/${organisationId}`}
		title={`For ${organisationName}`}
		class={`${badgeClasses} transition hover:border-go hover:text-go`}
	>
		{organisationName}
	</a>
{/if}
