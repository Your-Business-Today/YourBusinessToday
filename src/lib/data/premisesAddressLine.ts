/** What says where a premises stands: its register's address and postcode, and the sector it falls in. */
export type PremisesWhereabouts = { address: string; postcode: string; sector: string };

const nothingGiven = '';

/** Where a premises stands, as one line: its address and postcode, or its sector when the register gives neither. */
export function premisesAddressLine({ address, postcode, sector }: PremisesWhereabouts): string {
	const given = [address, postcode].filter((part) => part !== nothingGiven);
	if (given.length === 0) return sector;
	return given.join(', ');
}
