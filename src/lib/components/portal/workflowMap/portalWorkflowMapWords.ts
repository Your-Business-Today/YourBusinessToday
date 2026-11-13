/** What the portal's Your workflow map page says around the map. */
export function portalWorkflowMapMessages(organisationName: string) {
	return {
		introduction:
			`Who does what at ${organisationName}, and what passes between them. Check each station: mark it right, ` +
			'or not right and say what is wrong, and the next version puts it right.',
		noMap:
			`No workflow map has been filed for ${organisationName} yet. Once your business has been mapped with you, ` +
			'it is drawn here for you to check, station by station.',
		chooseStation: 'Choose a station to check it.',
		noChanges: 'The After changes nothing the Before shows.'
	};
}
