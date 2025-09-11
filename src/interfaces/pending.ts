export type Pending = {
	csrf: string;
	guildId: string;
	channelId: string;
	messageId: string;
	memberId: string;
};

export const pendingByDiscordId = new Map<string, Pending>();
