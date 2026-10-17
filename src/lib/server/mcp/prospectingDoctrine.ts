/** Rule 9 of the working doctrine: how a staff member's Claude works a patch. */
export const prospectingDoctrine = [
	'9. Prospecting is done on a patch, a piece of ground a staff member works. list_patches and',
	'   read_patch say what is covered; list_unsearched_sectors chooses where to go next; claim_sector',
	'   before searching, so nobody else works the same ground; read_sector first, so a business',
	'   already known is matched rather than recorded twice; record_sighting for each business found',
	'   on a public page, with the page it was read on; mark_sector_searched with one line on what',
	'   was done when the sector is finished; add_sighting_as_lead for the ones worth approaching.',
	'   Food businesses and trading places are already listed by list_patch_premises, from the Food',
	'   Standards Agency and Overture Maps: add_premises_as_lead for those, never a sighting. Before',
	'   an approach, read_patch_company gathers everything known about the company in one answer.',
	'   Business-contact data only, never LinkedIn, X, Facebook or Instagram, nothing behind a login:',
	'   the server refuses those pages whatever the doctrine says.'
];
