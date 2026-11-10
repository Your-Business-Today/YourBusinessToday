<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import NameDirectorForm from './NameDirectorForm.svelte';
	import OrganisationDirectorRow from './OrganisationDirectorRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BoardroomDirector } from '$lib/data/boardroomDirector';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';

	let {
		directors,
		members,
		canName
	}: { directors: BoardroomDirector[]; members: OrganisationMember[]; canName: boolean } = $props();

	const directorAccountIds = $derived(new Set(directors.map((director) => director.accountId)));
	const candidates = $derived(members.filter((member) => !directorAccountIds.has(member.id)));
	const canNameAnother = $derived(canName && candidates.length > 0);
</script>

<DashboardPanel title="Directors" count={directors.length}>
	<ul class={panelListClasses}>
		{#each directors as director (director.id)}
			<OrganisationDirectorRow {director} {canName} />
		{/each}
	</ul>
	{#if directors.length === 0}
		<p class={panelEmptyClasses}>No directors named yet. Only named directors enter the boardroom.</p>
	{/if}
	{#if canNameAnother}
		<NameDirectorForm {candidates} />
	{/if}
</DashboardPanel>
