<script lang="ts">
	import { boardPointAt } from '$lib/data/chat/whiteboardPen';
	import { chatWhiteboardLimits } from '$lib/data/chat/chatWhiteboardRules';
	import { drawBoard, paletteAt } from './whiteboardRendering';
	import type { WhiteboardBoard } from './whiteboardBoard.svelte';

	let { board, title, isDisabled }: { board: WhiteboardBoard; title: string; isDisabled: boolean } = $props();

	const { boardWidth, boardHeight } = chatWhiteboardLimits;

	let canvas = $state<HTMLCanvasElement | null>(null);
	let drawingPointerId: number | null = null;

	const context = $derived(canvas?.getContext('2d') ?? null);
	const palette = $derived(canvas === null ? null : paletteAt(canvas));

	function pointOf(event: PointerEvent) {
		const frame = (event.currentTarget as HTMLCanvasElement).getBoundingClientRect();
		return boardPointAt(event.clientX, event.clientY, frame);
	}

	function press(event: PointerEvent) {
		const isAnotherHandDrawing = drawingPointerId !== null;
		if (isAnotherHandDrawing || isDisabled) return;
		drawingPointerId = event.pointerId;
		(event.currentTarget as HTMLCanvasElement).setPointerCapture(event.pointerId);
		board.press(pointOf(event));
	}

	function move(event: PointerEvent) {
		if (event.pointerId !== drawingPointerId) return;
		board.move(pointOf(event));
	}

	function release(event: PointerEvent) {
		if (event.pointerId !== drawingPointerId) return;
		drawingPointerId = null;
		board.release();
	}

	$effect(() => {
		if (context === null || palette === null) return;
		drawBoard(context, board.items, palette, board.textAt);
	});
</script>

<canvas
	bind:this={canvas}
	width={boardWidth}
	height={boardHeight}
	aria-label={`The whiteboard ${title}: draw with a finger, a stylus or the mouse`}
	class="block aspect-video w-full cursor-crosshair touch-none select-none"
	onpointerdown={press}
	onpointermove={move}
	onpointerup={release}
	onpointercancel={release}
></canvas>
