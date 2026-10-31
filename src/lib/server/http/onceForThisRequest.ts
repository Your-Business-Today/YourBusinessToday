/** A lookup that runs the first time it is asked for and hands every later caller in the same request that answer. */
export function onceForThisRequest<Answer>(lookUp: () => Promise<Answer>): () => Promise<Answer> {
	let answer: Promise<Answer> | null = null;
	return () => {
		answer = answer ?? lookUp();
		return answer;
	};
}
