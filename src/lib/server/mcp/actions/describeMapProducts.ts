import { productStageNames, productWords } from '$lib/data/workflowMap/productAndLoopWords';
import type { MapProduct, ProductStep } from '$lib/data/workflowMap/productsOnTheMap';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** How a product on the map is changed, said at the end of every answer about the products. */
export const howProductsChange =
	'How it changes: a product is the stations the After plans for it. File the After again (file_workflow_map, stage after, ' +
	'every line and station carried forward with its key) to add a step to a product, take one out or name a new product: ' +
	"a station's doneIn names its product until the product is a project, and a step the product does by itself sits on a line of kind system named for it.";

/** read_map_products: each product the After recommends, live or planned, the steps it takes on and what goes wrong there today. */
export function describeMapProducts(organisationName: string, after: WorkflowMapVersion, products: MapProduct[]): string {
	const header = `## Products on the After map of ${organisationName}, version ${after.versionNumber}`;
	const body = products.length === 0 ? productWords.noProducts : products.map(productSection).join('\n\n');
	return [header, body, howProductsChange].join('\n\n');
}

function productSection({ name, stage, steps, fixes }: MapProduct, index: number): string {
	const stageName = productStageNames[stage].toLowerCase();
	const takesOn = steps.map(stepSentence).join('; ');
	const goesWrong = fixes.length === 0 ? productWords.nothingGoesWrong : fixes.join(' ');
	return `${index + 1}. **${name}**, ${stageName}. Takes on: ${takesOn}. What goes wrong there today: ${goesWrong}`;
}

function stepSentence({ stationName, stationKey, lineName }: ProductStep): string {
	return `${stationName} (\`${stationKey}\`, on ${lineName})`;
}
