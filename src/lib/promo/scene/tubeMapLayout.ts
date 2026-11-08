export type MapStation = { name: string; x: number; z: number; isInterchange: boolean };

export type MapLine = { name: string; colourIndex: number; stops: [number, number][] };

/** How information travels through a business, drawn as a tube map: each line a flow, each station a hand-off. */
export const mapStations: MapStation[] = [
	{ name: 'Enquiry', x: -24, z: -10, isInterchange: false },
	{ name: 'Quote', x: -14, z: -10, isInterchange: false },
	{ name: 'Order', x: -4, z: -10, isInterchange: true },
	{ name: 'Job', x: 6, z: -10, isInterchange: true },
	{ name: 'Site visit', x: 14, z: -2, isInterchange: false },
	{ name: 'Sign-off', x: 23, z: -2, isInterchange: false },
	{ name: 'Invoice', x: 8, z: 4, isInterchange: false },
	{ name: 'Paid', x: 23, z: 4, isInterchange: true },
	{ name: 'Supplier', x: -24, z: 10, isInterchange: false },
	{ name: 'Bill', x: -12, z: 10, isInterchange: false },
	{ name: 'Approved', x: 2, z: 10, isInterchange: false }
];

export const mapLines: MapLine[] = [
	{
		name: 'Sales',
		colourIndex: 0,
		stops: [
			[-24, -10],
			[6, -10]
		]
	},
	{
		name: 'Delivery',
		colourIndex: 1,
		stops: [
			[6, -10],
			[14, -2],
			[23, -2]
		]
	},
	{
		name: 'Money',
		colourIndex: 2,
		stops: [
			[-4, -10],
			[-4, -4],
			[4, 4],
			[23, 4]
		]
	},
	{
		name: 'Supply',
		colourIndex: 3,
		stops: [
			[-24, 10],
			[17, 10],
			[23, 4]
		]
	}
];
