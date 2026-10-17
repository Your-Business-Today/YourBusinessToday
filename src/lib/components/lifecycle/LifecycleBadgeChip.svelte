<script lang="ts">
	import { badgeText, type LifecycleBadge } from '$lib/data/lifecycleBadge';

	let { badge }: { badge: LifecycleBadge } = $props();

	const text = $derived(badgeText(badge));
	const hint = $derived(badge.isHeld ? `${badge.agent} holds this now` : 'The latest step an AI took');
</script>

<span
	title={hint}
	class="max-w-56 truncate whitespace-nowrap rounded-full border px-2 py-0.5 font-display text-xs"
	class:border-go={badge.isHeld}
	class:text-go={badge.isHeld}
	class:border-hairline={!badge.isHeld}
	class:text-chalk={!badge.isHeld}
>
	{badge.isHeld ? '●' : '○'} {text}
</span>
