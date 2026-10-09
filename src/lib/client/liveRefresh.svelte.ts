import { invalidate } from '$app/navigation';

const refreshEveryMilliseconds = 30_000;

/**
 * Re-reads one load dependency on a steady beat while the page is open, so a
 * feed shows what happened without the person reloading. Create inside a
 * component; it stops when the component goes.
 */
export class LiveRefresh {
	isRefreshing = $state(false);

	constructor(dependency: string, everyMilliseconds: number = refreshEveryMilliseconds) {
		$effect(() => {
			const timer = setInterval(() => this.refresh(dependency), everyMilliseconds);
			return () => clearInterval(timer);
		});
	}

	private async refresh(dependency: string): Promise<void> {
		if (this.isRefreshing || document.hidden) return;
		this.isRefreshing = true;
		try {
			await invalidate(dependency);
		} finally {
			this.isRefreshing = false;
		}
	}
}
