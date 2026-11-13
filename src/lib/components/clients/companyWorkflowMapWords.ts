/** What the staff page of a company on the Leads or Clients register says around its workflow map. */
export function companyWorkflowMapMessages(companyName: string) {
	return {
		introduction: `Who does what at ${companyName}, and what passes between them, as their people filed it. Read only.`,
		noMap:
			`No workflow map has been filed for ${companyName} yet. It appears here once one of their people runs ` +
			'the one prompt from Connect your Claude on their portal and says yes to what their Claude found.',
		chooseStation: 'Choose a station to see what it takes in, what it produces and where it is done.',
		noChanges: 'The After changes nothing the Before shows.'
	};
}
