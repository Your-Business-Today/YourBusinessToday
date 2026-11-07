import { boardColumns } from '../promoBoard';

/** The board's measurements in world units, centred on its set. */
export const boardShape = {
	columnWidth: 8.4,
	columnPitch: 9.3,
	cardWidth: 7.6,
	cardHeight: 3.42,
	cardGap: 0.45,
	headerHeight: 2.4,
	visibleSlots: 4,
	top: 10,
	padding: 0.4
};

const middleColumn = (boardColumns.length - 1) / 2;

const slotPitch = boardShape.cardHeight + boardShape.cardGap;

export const panelHeight = boardShape.headerHeight + boardShape.visibleSlots * slotPitch + boardShape.padding;

export const panelMiddle = boardShape.top - panelHeight / 2;

export const headerMiddle = boardShape.top - boardShape.headerHeight / 2;

export function columnX(column: number): number {
	return (column - middleColumn) * boardShape.columnPitch;
}

export function slotY(slot: number): number {
	const firstSlot = boardShape.top - boardShape.headerHeight - boardShape.cardHeight / 2;
	return firstSlot - slot * slotPitch;
}
