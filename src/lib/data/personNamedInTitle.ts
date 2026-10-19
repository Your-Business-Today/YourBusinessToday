const wordSeparator = /\s+/;
const regexSpecialCharacters = /[.*+?^${}()|[\]\\]/g;

/** The name people write in task titles for an account: the first word of its name, when it has one. */
export function nameUsedInTitles(accountName: string, email: string): string | null {
	const name = accountName.trim();
	if (name === '' || name === email) return null;
	const [firstWord] = name.split(wordSeparator);
	return firstWord;
}

/** Whether a task title names the person as a whole word: "Jeremy: …", "(Jeremy to confirm)", "Jeremy's". */
export function titleNamesPerson(title: string, name: string): boolean {
	const escapedName = name.replace(regexSpecialCharacters, '\\$&');
	return new RegExp(`(^|[^\\p{L}])${escapedName}($|[^\\p{L}])`, 'iu').test(title);
}
