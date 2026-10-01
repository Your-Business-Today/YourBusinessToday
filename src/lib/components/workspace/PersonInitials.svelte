<script lang="ts">
	import { initialsOf } from '$lib/data/initialsOf';

	let { name }: { name: string } = $props();
</script>

<span
	aria-hidden="true"
	class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-night font-display
		text-[0.7rem] text-chalk/70 uppercase ring-1 ring-hairline"
>
	{initialsOf(name)}
</span>
