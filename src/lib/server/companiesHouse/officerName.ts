const surnameFirstSeparator = ', ';

export function displayNameFromRegisterName(registerName: string): string {
	const [surname, forenames] = registerName.split(surnameFirstSeparator);
	const titledSurname = toTitleCase(surname.trim());
	if (forenames === undefined) return titledSurname;
	return `${toTitleCase(forenames.trim())} ${titledSurname}`.trim();
}

export function displayNameFromSearchTitle(title: string): string {
	return toTitleCase(title.trim());
}

function toTitleCase(words: string): string {
	return words
		.toLowerCase()
		.split(/(\s+|-)/)
		.map(capitaliseWord)
		.join('');
}

function capitaliseWord(word: string): string {
	if (word === '') return word;
	return word.charAt(0).toUpperCase() + word.slice(1);
}
