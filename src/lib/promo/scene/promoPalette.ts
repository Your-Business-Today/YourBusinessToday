import { Color } from 'three';

export type PromoPalette = {
	night: Color;
	carriage: Color;
	hairline: Color;
	chalk: Color;
	signal: Color;
	go: Color;
	caution: Color;
	lines: Color[];
};

const brandTokens = {
	night: '--color-night',
	carriage: '--color-carriage',
	hairline: '--color-hairline',
	chalk: '--color-chalk',
	signal: '--color-signal',
	go: '--color-go',
	caution: '--color-caution'
};

const lineTokens = [
	'--color-tube-victoria',
	brandTokens.go,
	'--color-tube-circle',
	'--color-tube-metropolitan'
];

function tokenColour(styles: CSSStyleDeclaration, token: string): Color {
	const value = styles.getPropertyValue(token);
	return new Color(value.trim());
}

/** The brand's colours, read from the site's own theme tokens so the film and the site never drift apart. */
export function readPromoPalette(element: Element): PromoPalette {
	const styles = getComputedStyle(element);
	const colourOf = (token: string) => tokenColour(styles, token);
	return {
		night: colourOf(brandTokens.night),
		carriage: colourOf(brandTokens.carriage),
		hairline: colourOf(brandTokens.hairline),
		chalk: colourOf(brandTokens.chalk),
		signal: colourOf(brandTokens.signal),
		go: colourOf(brandTokens.go),
		caution: colourOf(brandTokens.caution),
		lines: lineTokens.map(colourOf)
	};
}

/** The same colour as a CSS string, for drawing on a canvas. */
export function cssColour(colour: Color): string {
	return `#${colour.getHexString()}`;
}
