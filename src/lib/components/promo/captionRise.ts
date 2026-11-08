const riseInContainerWidths = 0.9;

/** How far a caption still has to rise into place: the whole rise while it is absent, none once it is fully shown. */
export function riseOf(presence: number): string {
	return `translateY(${(1 - presence) * riseInContainerWidths}cqw)`;
}
