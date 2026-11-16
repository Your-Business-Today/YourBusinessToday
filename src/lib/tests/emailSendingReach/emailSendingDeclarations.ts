/**
 * The actions whose code reaches the site's email sender but that never email anyone outside Your Business Today,
 * each with why, so they carry no SENDS EMAIL opening. A name here that no longer reaches the sender fails the test.
 */
export const emailSendingDeclarations: Record<string, string> = {
	answer_turn:
		'It reaches every action through runAction, but turnDelegation hands it only post_message or complete_todo, and neither sends.',
	confirm_workflow_map: "Its one email goes to Your Business Today's own staff inbox (ENQUIRY_NOTIFICATION_EMAIL), never to the client."
};
