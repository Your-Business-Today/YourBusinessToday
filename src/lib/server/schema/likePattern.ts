const likeWildcards = /[\\%_]/g;

/** The word with a like pattern's own wildcards made plain characters, so a name such as hair_salon is matched as written. */
export function literalInLike(word: string): string {
	return word.replace(likeWildcards, (wildcard) => `\\${wildcard}`);
}
