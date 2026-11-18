import { describe, expect, it } from 'vitest';
import { videoRunningTime } from './videoRunningTime';
import { videoSectionsOf } from './videoSections';

const video = (title: string, section: string, position: number) => ({ title, section, position });

describe('the library’s sections', () => {
	it('orders sections by their first video and videos by position, each section a line colour of its own', () => {
		const sections = videoSectionsOf([video('Raising a bill', 'Billing', 20), video('Signing in', 'Getting started', 1), video('Reading a bill', 'Billing', 15)]);
		expect(sections.map((section) => section.name)).toEqual(['Getting started', 'Billing']);
		expect(sections[1].videos.map((each) => each.title)).toEqual(['Reading a bill', 'Raising a bill']);
		expect(sections.map((section) => section.lineColour)).toEqual(['sky', 'lilac']);
	});
});

describe('a video’s running time', () => {
	it('reads as a player shows it', () => {
		expect(videoRunningTime(222)).toBe('3:42');
		expect(videoRunningTime(3909)).toBe('1:05:09');
		expect(videoRunningTime(null)).toBe('');
	});
});
