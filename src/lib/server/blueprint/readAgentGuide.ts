import type { AgentGuide } from '$lib/data/blueprint/mcpMap';

const frontMatterFence = '---';
const frontMatterField = /^(\w+):\s*(.*)$/;
const firstHeading = /^#\s+(.+)$/m;
const markdownExtension = /\.md$/;

/** A skill or agent file read as its name and what it is for: its front matter, or else its file name and first heading. */
export function readAgentGuide(text: string, path: string, fallbackName: string): AgentGuide {
	const fields = frontMatterOf(text);
	const heading = firstHeading.exec(text);
	return {
		name: fields.get('name') || fallbackName.replace(markdownExtension, ''),
		description: fields.get('description') || (heading?.[1] ?? ''),
		path
	};
}

function frontMatterOf(text: string): Map<string, string> {
	const lines = text.split('\n');
	if (lines[0]?.trim() !== frontMatterFence) return new Map();
	const end = lines.indexOf(frontMatterFence, 1);
	const fieldLines = lines.slice(1, end === -1 ? 1 : end);
	const fields = fieldLines.map((line) => frontMatterField.exec(line)).filter((match) => match !== null);
	return new Map(fields.map((match) => [match[1], match[2].trim()]));
}
