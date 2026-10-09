<script lang="ts">
	let { next = '' }: { next?: string } = $props();
</script>

<form method="POST" action="?/signInWithGoogle">
	<input type="hidden" name="next" value={next} />
	<button
		type="submit"
		class="flex w-full items-center justify-center gap-3 rounded-full border border-hairline
			px-7 py-3 font-display text-sm text-chalk/90 transition hover:border-chalk/40"
	>
		<svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true">
			<path
				fill="var(--color-google-blue)"
				d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.9z"
			/>
			<path
				fill="var(--color-google-green)"
				d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5l-3.9 3C3.2 21.3 7.3 24 12 24z"
			/>
			<path fill="var(--color-google-yellow)" d="M5.1 14.4a7 7 0 0 1 0-4.7l-3.9-3a12 12 0 0 0 0 10.7l3.9-3z" />
			<path
				fill="var(--color-google-red)"
				d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.7l3.9 3c1-2.9 3.7-5 6.9-5z"
			/>
		</svg>
		Continue with Google
	</button>
</form>
