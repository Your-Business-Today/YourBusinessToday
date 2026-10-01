const mailboxSeparator = '@';
const wordSeparator = /[^\p{L}]+/u;
const initialsLength = 2;

export function initialsOf(name: string): string {
	const [mailboxOrName] = name.split(mailboxSeparator);
	const words = mailboxOrName.split(wordSeparator).filter((word) => word !== '');
	if (words.length === 0) return '?';
	if (words.length === 1) return words[0].slice(0, initialsLength);
	return words
		.slice(0, initialsLength)
		.map((word) => word[0])
		.join('');
}
