<script lang="ts">
	import PersonInitials from '$lib/components/workspace/PersonInitials.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';

	let { personName, signOutPath }: { personName: string; signOutPath: string } = $props();
</script>

<div class="flex items-center gap-3 border-t border-hairline pt-4">
	<PersonInitials name={personName} />
	<span class="min-w-0 flex-1 truncate text-sm font-medium text-chalk-subtle">{personName}</span>
	<form method="POST" action={signOutPath}>
		<SubmitButton
			class="rounded px-2 py-1 text-sm font-medium text-chalk-muted transition
				hover:bg-carriage-raised hover:text-chalk"
		>
			Sign out
		</SubmitButton>
	</form>
</div>
