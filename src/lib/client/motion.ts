import { cubicOut } from 'svelte/easing';
import type { FlipParams } from 'svelte/animate';
import type { FadeParams, FlyParams, SlideParams } from 'svelte/transition';

/** How the site's surfaces move: quick enough never to wait for, slow enough to read as a change of place. */
export const backdropFade: FadeParams = { duration: 150 };

export const dialogRise: FlyParams = { y: 12, duration: 200, easing: cubicOut };

export const sheetSlide: FlyParams = { x: 64, duration: 240, easing: cubicOut };

export const menuDrop: FlyParams = { y: -6, duration: 150, easing: cubicOut };

export const foldOpen: SlideParams = { duration: 200, easing: cubicOut };

export const rowMove: FlipParams = { duration: 250, easing: cubicOut };

export const tabSwap: FadeParams = { duration: 150 };

/** How a view arrives: a short rise and fade, so a click reads as a replace rather than a page load. */
export const viewEntrance: FlyParams = { y: 10, duration: 220, easing: cubicOut };
