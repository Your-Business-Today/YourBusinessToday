const htmlEntities: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

const htmlSpecialCharacter = /[&<>"']/g;

export function escapeHtml(text: string): string {
	return text.replace(htmlSpecialCharacter, (character) => htmlEntities[character]);
}
