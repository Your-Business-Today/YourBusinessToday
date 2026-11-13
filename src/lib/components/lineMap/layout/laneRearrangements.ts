type Block = { start: number; end: number };

function lanesOf(order: string[]): number[] {
	return order.map((_, lane) => lane);
}

function blocksOf(order: string[]): Block[] {
	const lanes = lanesOf(order);
	return lanes.flatMap((start) => lanes.filter((lane) => lane >= start).map((lane) => ({ start, end: lane + 1 })));
}

function withSwapped(order: string[], first: number, second: number): string[] {
	const swapped = [...order];
	[swapped[first], swapped[second]] = [swapped[second], swapped[first]];
	return swapped;
}

function withBlockMoved(order: string[], { start, end }: Block, to: number): string[] {
	const block = order.slice(start, end);
	const rest = [...order.slice(0, start), ...order.slice(end)];
	return [...rest.slice(0, to), ...block, ...rest.slice(to)];
}

function withBlockReversed(order: string[], { start, end }: Block): string[] {
	return [...order.slice(0, start), ...order.slice(start, end).reverse(), ...order.slice(end)];
}

function everySwapOf(order: string[]): string[][] {
	const lanes = lanesOf(order);
	return lanes.flatMap((first) => lanes.filter((second) => second > first).map((second) => withSwapped(order, first, second)));
}

function everyBlockMoveOf(order: string[]): string[][] {
	return blocksOf(order).flatMap((block) => {
		const placesLeft = lanesOf(order.slice(block.end - block.start - 1));
		return placesLeft.filter((to) => to !== block.start).map((to) => withBlockMoved(order, block, to));
	});
}

/** Every order one step from this one: two lanes swapped, a run of lanes moved elsewhere, or a run of lanes turned round. */
export function rearrangementsOf(order: string[]): string[][] {
	const reversals = blocksOf(order).map((block) => withBlockReversed(order, block));
	return [...everySwapOf(order), ...everyBlockMoveOf(order), ...reversals];
}
