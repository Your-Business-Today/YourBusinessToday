import { describe, expect, it } from 'vitest';
import { renderDocumentHtml } from './renderDocumentHtml';

describe('a written document as the page shows it', () => {
	it('shows headings, lists and tables', () => {
		const html = renderDocumentHtml('# How it works\n\n- Sign in\n- Open the project\n\n| Ask | Unlocks |\n| --- | --- |\n| Sign-ins | Reports |');
		expect(html).toContain('<h1>How it works</h1>');
		expect(html).toContain('<li>Sign in</li>');
		expect(html).toContain('<td>Sign-ins</td>');
	});

	it('shows HTML written into the document as words, never as markup', () => {
		const html = renderDocumentHtml('Hello <script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
		expect(html).not.toContain('<script>');
		expect(html).not.toContain('<img src=x');
		expect(html).toContain('&lt;script&gt;');
	});

	it('follows web and email links, and drops a script address', () => {
		expect(renderDocumentHtml('[site](https://example.com)')).toContain('<a href="https://example.com" rel="noopener noreferrer">site</a>');
		expect(renderDocumentHtml('[mail](mailto:a@example.com)')).toContain('href="mailto:a@example.com"');
		const scripted = renderDocumentHtml('[click](javascript:alert(1)) ![x](javascript:alert(1)) [tab](java\tscript:alert(1))');
		expect(scripted).not.toContain('href=');
		expect(scripted).not.toContain('src=');
	});
});
