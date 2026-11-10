<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import type { BadgeTone } from '$lib/components/site/badgeTones';
	import { projectStatusLabels, type ProjectStatus } from '$lib/data/projectStatus';

	let { status }: { status: ProjectStatus } = $props();

	const statusTones: Record<ProjectStatus, BadgeTone> = {
		scoping: 'notStarted',
		building: 'positive',
		testing: 'warning',
		maintenance: 'progress',
		complete: 'neutral',
		on_hold: 'negative'
	};
</script>

<Badge label={projectStatusLabels[status]} tone={statusTones[status]} />
