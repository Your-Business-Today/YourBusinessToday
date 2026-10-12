/** Things spread over the grid, found again by the 200-metre cells their boxes touch. */
export class GridCellIndex<Item> {
	private readonly cells = new Map<string, Item[]>();
	private readonly cellSize: number;

	constructor(cellSizeMetres = 200) {
		this.cellSize = cellSizeMetres;
	}

	add(item: Item, box: { minX: number; minY: number; maxX: number; maxY: number }): void {
		for (const key of this.keysOver(box)) this.cells.set(key, [...(this.cells.get(key) ?? []), item]);
	}

	near(x: number, y: number): Item[] {
		return this.cells.get(this.keyOf(x, y)) ?? [];
	}

	/** Everything in the cell and the eight around it. */
	around(x: number, y: number): Item[] {
		const items: Item[] = [];
		for (let dx = -1; dx <= 1; dx += 1) {
			for (let dy = -1; dy <= 1; dy += 1) items.push(...this.near(x + dx * this.cellSize, y + dy * this.cellSize));
		}
		return items;
	}

	private keysOver(box: { minX: number; minY: number; maxX: number; maxY: number }): string[] {
		const keys: string[] = [];
		for (let x = box.minX; x <= box.maxX + this.cellSize; x += this.cellSize) {
			for (let y = box.minY; y <= box.maxY + this.cellSize; y += this.cellSize) keys.push(this.keyOf(x, y));
		}
		return keys;
	}

	private keyOf(x: number, y: number): string {
		return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
	}
}
