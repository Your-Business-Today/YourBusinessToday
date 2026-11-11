<script lang="ts">
	import { goto } from '$app/navigation';
	import FramePicker from '$lib/components/frame/FramePicker.svelte';
	import { projectSwitchOptions, samePageInProject } from './projectPages';
	import type { FramePickOption } from '$lib/components/frame/framePicks';
	import type { OpenProject } from '$lib/components/frame/frameTrail';

	let {
		project,
		projects,
		pathname
	}: { project: OpenProject; projects: FramePickOption[]; pathname: string } = $props();

	const options = $derived(projectSwitchOptions(projects, project));

	function switchProject(switchedToId: string): void {
		goto(samePageInProject(project.id, pathname, switchedToId));
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
