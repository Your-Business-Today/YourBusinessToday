<script lang="ts">
	import type { PersonLink } from '$lib/server/people/getLinksForPeople';

	let { link }: { link: PersonLink } = $props();
</script>

<li class="flex items-center gap-1 rounded-full border border-hairline pl-3 text-xs">
	<a href={link.url} target="_blank" rel="noreferrer" class="text-chalk/80 hover:text-signal">
		{link.label}
	</a>
	<form method="POST" action="?/removeLink">
		<input type="hidden" name="linkId" value={link.id} />
		<button
			type="submit"
			aria-label={`Remove ${link.label}`}
			class="px-2 py-1 text-chalk/40 hover:text-signal"
		>
			✕
		</button>
	</form>
</li>
