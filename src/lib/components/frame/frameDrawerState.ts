/** The phone's drawer is open on a history entry of its own, so Back closes it. */
export function isFrameDrawerOpen(pageState: App.PageState): boolean {
	return pageState.isFrameDrawerOpen ?? false;
}

export function withFrameDrawerOpen(pageState: App.PageState): App.PageState {
	return { ...pageState, isFrameDrawerOpen: true };
}
