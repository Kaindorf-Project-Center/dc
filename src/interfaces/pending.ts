export type PendingAuth = {
	csrf: string;
	guildId: string;
	channelId: string;
	messageId: string;
	memberId: string;
};

export const pendingAuthByDiscordId = new Map<string, PendingAuth>();

export type PendingUnauth = {
	csrf: string;
	guildId: string;
	channelId: string;
	messageId: string;
	memberId: string;
};

export const pendingUnauthByDiscordId = new Map<string, PendingUnauth>();
