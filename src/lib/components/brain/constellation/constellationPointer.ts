const CLICK_DRIFT_LIMIT_PIXELS = 6;

export type PointerHandlers = {
	onMove: (pointerX: number, pointerY: number) => void;
	onClick: (pointerX: number, pointerY: number) => void;
	onLeave: () => void;
};

type PointerListeners = Record<'pointerdown' | 'pointerup' | 'pointermove' | 'pointerleave', (event: PointerEvent) => void>;

/** A press on the brain that counts as a click only when the pointer has not dragged the brain round. */
class PointerPress {
	private downX = 0;
	private downY = 0;

	constructor(private readonly handlers: PointerHandlers) {}

	listeners(): PointerListeners {
		return {
			pointerdown: (event) => this.remember(event),
			pointerup: (event) => this.releaseAsClick(event),
			pointermove: (event) => this.handlers.onMove(event.clientX, event.clientY),
			pointerleave: () => this.handlers.onLeave()
		};
	}

	private remember(event: PointerEvent): void {
		this.downX = event.clientX;
		this.downY = event.clientY;
	}

	private releaseAsClick(event: PointerEvent): void {
		const { clientX, clientY } = event;
		const drift = Math.hypot(clientX - this.downX, clientY - this.downY);
		if (drift > CLICK_DRIFT_LIMIT_PIXELS) return;
		this.handlers.onClick(clientX, clientY);
	}
}

export function attachConstellationPointer(canvas: HTMLCanvasElement, handlers: PointerHandlers): () => void {
	const listeners = Object.entries(new PointerPress(handlers).listeners());
	for (const [eventName, listener] of listeners) canvas.addEventListener(eventName, listener as EventListener);
	return () => {
		for (const [eventName, listener] of listeners) canvas.removeEventListener(eventName, listener as EventListener);
	};
}
