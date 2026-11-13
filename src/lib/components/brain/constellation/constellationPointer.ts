const CLICK_DRIFT_LIMIT_PIXELS = 6;

export type PointerHandlers = {
	onMove: (pointerX: number, pointerY: number) => void;
	onClick: (pointerX: number, pointerY: number) => void;
	onLeave: () => void;
};

export function attachConstellationPointer(
	canvas: HTMLCanvasElement,
	handlers: PointerHandlers
): () => void {
	let downX = 0;
	let downY = 0;

	function rememberPress(event: PointerEvent): void {
		downX = event.clientX;
		downY = event.clientY;
	}

	function releaseAsClick(event: PointerEvent): void {
		const drift = Math.hypot(event.clientX - downX, event.clientY - downY);
		if (drift > CLICK_DRIFT_LIMIT_PIXELS) return;
		handlers.onClick(event.clientX, event.clientY);
	}

	function followMove(event: PointerEvent): void {
		handlers.onMove(event.clientX, event.clientY);
	}

	function leave(): void {
		handlers.onLeave();
	}

	canvas.addEventListener('pointerdown', rememberPress);
	canvas.addEventListener('pointerup', releaseAsClick);
	canvas.addEventListener('pointermove', followMove);
	canvas.addEventListener('pointerleave', leave);
	return () => {
		canvas.removeEventListener('pointerdown', rememberPress);
		canvas.removeEventListener('pointerup', releaseAsClick);
		canvas.removeEventListener('pointermove', followMove);
		canvas.removeEventListener('pointerleave', leave);
	};
}
