type ToolResult = { isError?: boolean; content?: { text?: string }[] };

type CallAnswer = { error?: { message: string }; result?: ToolResult };

const unexplainedFailure = 'it answered with an error and no words';

/** What went wrong with one call on the connector, in a sentence, or null when it answered. */
export function failureOfAnswer(callName: string, answer: unknown): string | null {
	const { error, result } = answer as CallAnswer;
	if (error !== undefined) return `${callName} was refused: ${error.message}`;
	if (result?.isError !== true) return null;
	return `${callName} failed: ${firstTextOf(result)}`;
}

/** A call that threw instead of answering, in a sentence. */
export function failureOfThrow(callName: string, failure: unknown): string {
	const message = failure instanceof Error ? failure.message : String(failure);
	return `${callName} threw: ${message}`;
}

function firstTextOf(result: ToolResult): string {
	const blocks = result.content ?? [];
	return blocks[0]?.text ?? unexplainedFailure;
}
