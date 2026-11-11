<script lang="ts">
	import { goto } from '$app/navigation';
	import FramePicker from '$lib/components/frame/FramePicker.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { workspaceWidthClasses } from '$lib/components/workspace/workspaceStyles';
	import { currentProjectPage, projectPageLinks, projectSwitchOptions, samePageInProject } from './projectBar';
	import type { FramePickOption } from '$lib/components/frame/framePicks';

	let {
		projectId,
		projectName,
		projects,
		pathname
	}: { projectId: string; projectName: string | null; projects: FramePickOption[]; pathname: string } = $props();

	const options = $derived(projectSwitchOptions(projects, projectId, projectName));
	const tabs = $derived(projectPageLinks(projectId).map(({ href, label }) => ({ key: href, label, count: null, href })));
	const selectedKey = $derived(currentProjectPage(projectId, pathname)?.href ?? '');

	function switchProject(switchedToId: string): void {
		goto(samePageInProject(projectId, pathname, switchedToId));
	}
</script>

<nav aria-label="Project" class="border-b border-hairline bg-carriage/30 print:hidden">
	<div class={`${workspaceWidthClasses} flex flex-col gap-2 pt-3 md:flex-row md:items-end md:gap-6`}>
		<div class="md:w-72 md:pb-2">
			<FramePicker caption="Project" {options} pickedId={projectId} emptyLabel="No projects" onPick={switchProject} />
		</div>
		<div class="min-w-0 flex-1 [&>[role=tablist]]:border-b-0">
			<TabStrip {tabs} {selectedKey} />
		</div>
	</div>
</nav>
