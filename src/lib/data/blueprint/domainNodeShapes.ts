import { domainEntityKinds, relationshipKinds, type DomainEntityKind, type RelationshipKind } from './domainModel';

type Box = { x: number; y: number; width: number; height: number };

const recordCorner = 3;
const pointDepth = 8;

/** A box with rounded corners as an outline path. */
function roundedBox({ x, y, width, height }: Box, radius: number): string {
	const right = x + width;
	const bottom = y + height;
	const arc = `A ${radius} ${radius} 0 0 1`;
	const sides = [`M ${x + radius} ${y}`, `H ${right - radius}`, `${arc} ${right} ${y + radius}`, `V ${bottom - radius}`];
	const back = [`${arc} ${right - radius} ${bottom}`, `H ${x + radius}`, `${arc} ${x} ${bottom - radius}`, `V ${y + radius}`];
	return [...sides, ...back, `${arc} ${x + radius} ${y}`, 'Z'].join(' ');
}

/** A box with both ends drawn to a point, as an operation is. */
function pointedBox({ x, y, width, height }: Box): string {
	const middle = y + height / 2;
	const right = x + width;
	return `M ${x + pointDepth} ${y} H ${right - pointDepth} L ${right} ${middle} L ${right - pointDepth} ${y + height} H ${x + pointDepth} L ${x} ${middle} Z`;
}

/** A tag pointing onwards, as an event is. */
function tag({ x, y, width, height }: Box): string {
	const right = x + width;
	return `M ${x} ${y} H ${right - pointDepth} L ${right} ${y + height / 2} L ${right - pointDepth} ${y + height} H ${x} Z`;
}

const outlines: Record<DomainEntityKind, (box: Box) => string> = {
	[domainEntityKinds.record]: (box) => roundedBox(box, recordCorner),
	[domainEntityKinds.detail]: (box) => roundedBox(box, box.height / 2),
	[domainEntityKinds.operation]: pointedBox,
	[domainEntityKinds.event]: tag
};

/** The outline each kind of thing is drawn in: a record a box, a detail a pill, an operation pointed at both ends, an event a tag. */
export function nodeOutline(kind: DomainEntityKind, box: Box): string {
	return outlines[kind](box);
}

/** The dashes each kind of line is drawn with: a holding line solid, a reference dashed, an event's mark dotted. */
export const relationshipDashes: Record<RelationshipKind, string | undefined> = {
	[relationshipKinds.containment]: undefined,
	[relationshipKinds.reference]: '4 3',
	[relationshipKinds.marks]: '1 3'
};

/** The dashes a group's outline is drawn with. */
export const groupOutlineDashes = '6 4';
