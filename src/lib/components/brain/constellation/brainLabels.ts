import { CoverClearance } from './coverClearance';
import { coverWidthIn, placesBesideTheCell, placesOnTheRing, type LabelScreen } from './labelAnchoring';
import { labelRoles, labelsWorthShowing, wholeBrainAttention, type ChosenLabel, type LabelAttention, type LabelRole } from './labelChoice';
import { labelsThatFit, type LabelBox } from './labelPlacement';
import { labelClassesFor, labelLayerClasses } from './labelStyles';
import { openLabelled, pointAtLabelled, type LabelActions } from './labelActions';
import type { Vector3 } from 'three';
import type { ConstellationModel } from './constellationTypes';

const controlsHeightPixels = 64;

type Label = { element: HTMLSpanElement; anchor: Vector3; isCoreArea: boolean; role: LabelRole; width: number; height: number };

/** The names written over the brain: only those worth reading for what is looked at, and never one over another. */
export class BrainLabels {
	private readonly layer = document.createElement('div');
	private readonly labels = new Map<string, Label>();
	private readonly clearance = new CoverClearance();
	private attention: LabelAttention = wholeBrainAttention;
	private chosen: ChosenLabel[] = [];
	private model: ConstellationModel;

	constructor(container: HTMLElement, model: ConstellationModel, private readonly actions: LabelActions) {
		this.layer.className = labelLayerClasses;
		container.prepend(this.layer);
		this.model = model;
		this.rebuild(model);
	}

	rebuild(model: ConstellationModel): void {
		this.model = model;
		this.layer.replaceChildren();
		this.labels.clear();
		for (const nucleus of model.nuclei) this.write(nucleus.slug, nucleus.name, nucleus.position, nucleus.isCoreDomain);
		for (const neuron of model.neurons) this.write(neuron.slug, neuron.title, neuron.position, false);
		this.attendTo(this.attention);
	}

	attendTo(attention: LabelAttention): void {
		this.attention = attention;
		this.chosen = labelsWorthShowing(this.model, attention).filter((chosen) => this.labels.has(chosen.slug));
		for (const chosen of this.chosen) this.dress(chosen);
	}

	/** Moves the chosen labels to where their cells are on the screen this frame, and shows those with room. */
	place(screen: LabelScreen): void {
		const { camera, widthPixels, heightPixels } = screen;
		const coverWidth = coverWidthIn(this.layer.parentElement);
		this.clearance.keepClear(camera, widthPixels, heightPixels, coverWidth);
		const uncovered = { topPixels: controlsHeightPixels, widthPixels: widthPixels - coverWidth, heightPixels };
		const boxes = labelsThatFit(this.chosen.map((chosen) => this.placesFor(chosen, screen)), uncovered);
		const boxesBySlug = new Map(this.chosen.map((chosen, index) => [chosen.slug, boxes[index]]));
		for (const [slug, label] of this.labels) this.show(label, boxesBySlug.get(slug) ?? null);
	}

	dispose(): void {
		this.layer.remove();
	}

	private write(slug: string, text: string, anchor: Vector3, isCoreArea: boolean): void {
		const element = document.createElement('span');
		element.textContent = text;
		const label: Label = { element, anchor, isCoreArea, role: 'page', width: 0, height: 0 };
		element.addEventListener('click', () => openLabelled(this.actions, slug, label.role));
		const isWholeBrain = () => this.attention.contextSlug === null;
		element.addEventListener('pointerenter', () => pointAtLabelled(this.actions, slug, label.role, isWholeBrain()));
		element.addEventListener('pointerleave', () => pointAtLabelled(this.actions, null, label.role, isWholeBrain()));
		this.layer.append(element);
		this.labels.set(slug, label);
	}

	private dress(chosen: ChosenLabel): void {
		const label = this.labels.get(chosen.slug);
		if (label === undefined) return;
		const { element } = label;
		label.role = chosen.role;
		element.className = labelClassesFor(chosen.role, label.isCoreArea);
		label.width = element.offsetWidth;
		label.height = element.offsetHeight;
	}

	private placesFor(chosen: ChosenLabel, screen: LabelScreen): LabelBox[] {
		const label = this.labels.get(chosen.slug);
		if (label === undefined) return [];
		const isWholeBrainArea = chosen.role === labelRoles.area && this.attention.contextSlug === null;
		const placeAlong = isWholeBrainArea ? placesOnTheRing : placesBesideTheCell;
		return placeAlong(label.anchor, label, screen);
	}

	private show(label: Label, box: LabelBox | null): void {
		const { style } = label.element;
		const isShown = box !== null;
		style.opacity = isShown ? '1' : '0';
		style.pointerEvents = isShown && label.role !== labelRoles.opened ? 'auto' : 'none';
		if (isShown) style.transform = `translate(${Math.round(box.left)}px, ${Math.round(box.top)}px)`;
	}
}
