/** How a person's Claude finds a workflow map, in the order the conversation goes: James's June method. */
export const mapInterviewStages = [
	'**The business:** what it sells, who buys it and roughly how big the team is.',
	'**The roles:** every hat that is worn, official or not. One person often wears several: each hat is a line of its own. Then ask which lines are not hats in the business at all: an outside party, such as a customer, a supplier or a regulator, or a system the work runs through. File each line with its kind: role, outside party or system.',
	'**The tasks of each role,** the role the person knows best first: what it does, task by task, in the order the work flows. Name each one short, starting with a verb, such as "Issue invoice".',
	'**What each task takes in and produces:** what must exist before it can start, and what it hands on. Push past vague answers: "the quote" is an answer, "an approved quote in the accounts package" is a better one.',
	'**What arrives from outside:** what comes in from beyond the map to start the work, who or what it arrives from, and the task it starts: an enquiry from a customer, a supplier\'s invoice, the first of the month for a monthly run. Ask it of every task that no one hands work to.',
	'**The hand-overs:** wherever one task\'s output lands with another role. These are where a business leaks time and money, so always ask what goes wrong or is delayed there.',
	'**The outputs the business runs on:** what a customer, a supplier or a regulator receives, or the business steers by, such as an invoice or a cashflow forecast. Mark them on the task that produces them.'
] as const;

/** How the questions are asked, whichever stage the conversation is at. */
export const mapQuestioningRules = [
	'Ask exactly one question at a time, in the business\'s own words, and follow the person\'s story rather than forcing the next stage.',
	'Prefer the concrete: "walk me through the last one" beats "describe your process".',
	'Chase the unofficial: the spreadsheet kept on the side, the person everyone really asks, the check done from memory.',
	'Let the gaps choose the next question: a task with nothing to take in, a role with one task, an output that goes nowhere.',
	'What you assumed is asked, never filed: file only what the person said or what a source you read states, and put everything you inferred to them as a question.',
	'When the person says nothing goes wrong at a hand-over, file that in their words as what goes wrong there, so it is not asked again.'
] as const;

/** How a map is shaped so it draws clearly: the order things are filed in is the order the map draws and reads them. */
export const mapDrawingRules = [
	'File the lines in the order the work first reaches them, starting with the role where a piece of work begins: the map draws them top to bottom in that order and wraps a long map into rows, so the order filed is the order read.',
	'File each line\'s stations in the order they are done, and each hand-over from the station that gives to the one that takes; one goes back to an earlier station only when the work truly goes round again.',
	'Name each station in at most four short words, starting with a verb, and each role in at most three: the map fits a name on two short lines and no more.',
	'Keep a station on the role that does it, even when it comes much later, such as the client using a release: the line carries on to it, row after row.',
	'A hand-over is only for what passes between roles; the next task on the same line needs none.'
] as const;
