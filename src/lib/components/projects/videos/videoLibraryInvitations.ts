import type { VideoLibrary } from '$lib/projectVideos/videoLibraries';

/** What an empty library says it is for, and a request a person could make of their Claude to start it. */
export type LibraryInvitation = { purpose: string; exampleAsk: string };

export const videoLibraryInvitations: Record<VideoLibrary, (projectName: string) => LibraryInvitation> = {
	tutorials: (projectName) => ({
		purpose: `Tutorial videos for ${projectName} show here, in sections, for everyone on the project to watch.`,
		exampleAsk: `“Make a short tutorial video showing how to sign in to ${projectName}, and put it in the project’s videos under Getting started.”`
	}),
	promotional: (projectName) => ({
		purpose: `Promotional videos for ${projectName} show here, in sections, for everyone on the project to watch and take out to the world.`,
		exampleAsk: `“Make a sixty-second promotional video showing off ${projectName}, and put it in the project’s promotional videos under Launch.”`
	})
};
