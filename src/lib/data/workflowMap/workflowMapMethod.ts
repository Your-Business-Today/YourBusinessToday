/** How a person's Claude finds a workflow map, in the order the conversation goes: James's June method. */
export const mapInterviewStages = [
	'**The business:** what it sells, who buys it and roughly how big the team is.',
	'**The roles:** every hat that is worn, official or not. One person often wears several: each hat is a line of its own.',
	'**The tasks of each role,** the role the person knows best first: what it does, task by task, in the order the work flows. Name each one short, starting with a verb, such as "Issue invoice".',
	'**What each task takes in and produces:** what must exist before it can start, and what it hands on. Push past vague answers: "the quote" is an answer, "an approved quote in the accounts package" is a better one.',
	'**The hand-overs:** wherever one task\'s output lands with another role. These are where a business leaks time and money, so always ask what goes wrong or is delayed there.',
	'**The outputs the business runs on:** what a customer, a supplier or a regulator receives, or the business steers by, such as an invoice or a cashflow forecast. Mark them on the task that produces them.'
] as const;

/** How the questions are asked, whichever stage the conversation is at. */
export const mapQuestioningRules = [
	'Ask exactly one question at a time, in the business\'s own words, and follow the person\'s story rather than forcing the next stage.',
	'Prefer the concrete: "walk me through the last one" beats "describe your process".',
	'Chase the unofficial: the spreadsheet kept on the side, the person everyone really asks, the check done from memory.',
	'Let the gaps choose the next question: a task with nothing to take in, a role with one task, an output that goes nowhere.'
] as const;
