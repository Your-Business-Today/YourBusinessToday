/** Where a sector's shape came from, as postcode_sectors.boundary_source names it; empty while the sector is drawn as a circle. */
export const sectorBoundarySources = { none: '', codePointVoronoi: 'code_point_voronoi' } as const;

const boundarySourceLabels: Record<string, string> = {
	[sectorBoundarySources.none]: 'Drawn as a circle at the centre of its postcodes until its shape is loaded.',
	[sectorBoundarySources.codePointVoronoi]:
		"Shape: the ground nearer this sector's postcodes than any other sector's, from OS Code-Point Open, cut at the coast by OS Boundary-Line."
};

export function boundarySourceLabelOf(source: string): string {
	return boundarySourceLabels[source] ?? `Shape from ${source}.`;
}

/** The credit OS Code-Point Open asks for wherever shapes drawn from it are shown. */
export function sectorShapeCredit(year: number): string {
	return `Sector shapes contain OS data © Crown copyright and database right ${year}; Royal Mail data © Royal Mail copyright and database right ${year}; National Statistics data © Crown copyright and database right ${year}.`;
}
