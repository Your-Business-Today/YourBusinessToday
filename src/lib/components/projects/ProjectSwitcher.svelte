<script lang="ts">
	import { goto } from '$app/navigation';
	import FramePicker from '$lib/components/frame/FramePicker.svelte';
	import { projectSwitchOptions, samePageInProject } from './projectPages';
	import type { FramePickOption } from '$lib/components/frame/framePicks';
	import type { OpenProject } from '$lib/components/frame/frameTrail';

	let {
		project,
		projects,
		address
	}: { project: OpenProject; projects: FramePickOption[]; address: URL } = $props();

	const options = $derived(projectSwitchOptions(projects, project));

	function switchProject(switchedToId: string): void {
		goto(samePageInProject(project.id, address, switchedToId));
	}
</script>

<FramePicker
	caption="Project"
	look="crumb"
	{options}
	pickedId={project.id}
	emptyLabel="No projects"
	onPick={switchProject}
/>
