import { describe, expect, it } from 'vitest';
import { adoptedDecision } from '../testing/decisionFixture';
import { brandSheetOf } from './brandSheet';
import { builtInTraits } from '../traits/traitCatalogue';
import { findMedium } from '../mediums/mediumCatalogue';
import { notSaidInTheKit } from './brandSheetRoles';
import { resolveBrand } from '../resolution/resolveBrand';
import type { Medium } from '../mediums/mediumDefinition';
import type { TraitDefinition } from '../traits/traitDefinition';

const website = findMedium('web.site') as Medium;
const subject = { brandName: 'Acme', projectName: 'Acme website', readOn: '2026-11-10' };
const seasonal: TraitDefinition = {
	key: 'look.colour.seasonal',
	facet: 'look',
	kind: 'colour',
	label: 'Seasonal colour',
	purpose: 'The winter campaign',
	isCustom: true
};

function sheetOf(decisions = [adoptedDecision('look.colour.primary', 'all', '#0a2540')], catalogue = builtInTraits): string {
	return brandSheetOf(subject, resolveBrand(decisions, catalogue, website));
}

describe('a project’s brand sheet from the kit', () => {
	it('is in the widget-design skill’s shape, every section present', () => {
		const sheet = sheetOf();
		const headings = sheet.split('\n').filter((line) => line.startsWith('#'));
		expect(headings).toEqual(['# Brand', '## Palette', '## Type', '## Spacing', '## Radius · Elevation · Motion', '## Unmapped']);
		expect(sheet).toContain("Sources: Acme's brand kit in Your Business Today, as it holds for Website (web.site), for Acme website, read 2026-11-10.");
	});

	it('gives each colour its token, value, role and what it is never for', () => {
		expect(sheetOf()).toContain(
			'| `--brand-colour-primary` | Primary colour · #0a2540 | The colour people know the brand by | Body text, or a fill behind running text |'
		);
	});

	it('says a brand’s own colour has no never-for until the kit says one', () => {
		const sheet = sheetOf([adoptedDecision('look.colour.seasonal', 'all', '#c0ffee')], [...builtInTraits, seasonal]);
		expect(sheet).toContain(`| \`--brand-colour-seasonal\` | Seasonal colour · #c0ffee | The winter campaign | ${notSaidInTheKit} |`);
	});

	it('puts type, spacing, shape and motion each in its own section', () => {
		const sheet = sheetOf([
			adoptedDecision('look.type.displayFamily', 'all', 'Space Grotesk'),
			adoptedDecision('look.space.unit', 'all', '4px'),
			adoptedDecision('look.shape.radius', 'web', '0px'),
			adoptedDecision('motion.timing.standard', 'all', '200ms')
		]);
		expect(sheet).toContain('| `--brand-type-display-family` | Space Grotesk | Display typeface: Headlines, hooks and titles |');
		expect(sheet).toContain('- `--brand-space-unit` = 4px: Spacing unit. The step every gap and margin is a multiple of.');
		expect(sheet).toContain('- `--brand-shape-radius` = 0px: Corner radius.');
		expect(sheet).toContain('- `--brand-timing-standard` = 200ms: Standard duration.');
		expect(sheet).toContain('## Palette\nNothing decided in the kit yet.');
	});

	it('lists what has no token and what the kit has not decided under Unmapped, and nothing of the voice', () => {
		const sheet = sheetOf([adoptedDecision('look.imagery.style', 'all', 'daylight, real people'), adoptedDecision('voice.tone', 'all', 'warm')]);
		expect(sheet).toContain('- Decided in the kit, with no token: Imagery style (look.imagery.style) = daylight, real people');
		expect(sheet).toMatch(/- Not decided in the kit for Website yet: .*look\.colour\.primary/);
		expect(sheet).not.toContain('voice.tone');
		expect(sheet).not.toContain('warm');
	});

	it('keeps a value holding a pipe inside its cell', () => {
		const sheet = sheetOf([adoptedDecision('look.type.bodyFamily', 'all', 'Inter | system-ui')]);
		expect(sheet).toContain('| `--brand-type-body-family` | Inter \\| system-ui |');
	});
});
