/** What a member reads in place of the composer when the bot cannot answer. */
export const chatbotQuietMessages = {
	paused: 'This bot is paused.',
	poolEmpty: 'This bot is out of credits — its owner needs to top it up.',
	allowanceUsedUp: (ownerName: string) =>
		`Your allowance for this period is used up — ask ${ownerName} for more.`
};

export const unnamedChatbotOwner = 'the bot owner';
