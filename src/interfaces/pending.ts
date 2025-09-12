import type { Locale } from 'discord.js';

export type Pending = {
	csrf: string;
	guildId: string;
	channelId: string;
	messageId: string;
	memberId: string;
	locale?: Locale;
};

export const pendingByDiscordId = new Map<string, Pending>();
