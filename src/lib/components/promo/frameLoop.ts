const millisecondsPerSecond = 1000;

/** Calls draw on every animation frame with the time since the last one, until the returned stop is called. */
export function runFrameLoop(draw: (frameTime: number, elapsedSeconds: number) => void): () => void {
	let frameRequest = 0;
	let lastFrameTime: number | null = null;
	const onFrame = (frameTime: number) => {
		const elapsedSeconds = lastFrameTime === null ? 0 : (frameTime - lastFrameTime) / millisecondsPerSecond;
		lastFrameTime = frameTime;
		draw(frameTime, elapsedSeconds);
		frameRequest = requestAnimationFrame(onFrame);
	};
	frameRequest = requestAnimationFrame(onFrame);
	return () => cancelAnimationFrame(frameRequest);
}

/** Tells the scene the size it is shown at, now and whenever the element changes size. */
export function followSize(
	element: HTMLElement,
	resize: (width: number, height: number, pixelRatio: number) => void,
	pixelRatio: number
): () => void {
	const apply = () => resize(element.clientWidth, element.clientHeight, pixelRatio);
	const observer = new ResizeObserver(apply);
	observer.observe(element);
	apply();
	return () => observer.disconnect();
}
