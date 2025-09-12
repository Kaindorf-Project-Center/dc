import type { Locale } from 'discord.js';
export type PendingAuth = {
	csrf: string;
	guildId: string;
	channelId: string;
	messageId: string;
	memberId: string;
	locale?: Locale;
};

export const pendingAuthByDiscordId = new Map<string, PendingAuth>();

export type PendingUnauth = {
	csrf: string;
	guildId: string;
	channelId: string;
	messageId: string;
	memberId: string;
	locale?: Locale;
};

export const pendingUnauthByDiscordId = new Map<string, PendingUnauth>();
