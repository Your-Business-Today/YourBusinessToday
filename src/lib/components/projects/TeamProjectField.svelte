<script lang="ts">
	import { page } from '$app/state';
	import {
		teamProjectChosen,
		teamProjectField,
		teamProjectHint,
		teamProjectNotChosen,
		teamProjectTitle
	} from '$lib/data/teamProject';

	let { isTeamProject }: { isTeamProject: boolean } = $props();

	const layoutData = $derived(page.data);
	const isStaff = $derived(layoutData.isStaff === true || layoutData.isAdmin === true);
</script>

{#if isStaff}
	<label class="flex items-start gap-3">
		<input type="hidden" name={teamProjectField} value={teamProjectNotChosen} />
		<input
			type="checkbox"
			name={teamProjectField}
			value={teamProjectChosen}
			checked={isTeamProject}
			class="mt-1 accent-go"
		/>
		<span class="flex flex-col gap-0.5">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">{teamProjectTitle}</span>
			<span class="text-xs text-chalk/50">{teamProjectHint}</span>
		</span>
	</label>
{/if}
