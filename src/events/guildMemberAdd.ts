import type { GuildMember } from 'discord.js';
import { Events } from 'discord.js';
import { handleAuthentication } from '../handlers/authHandler';
import type { Event } from '../interfaces/Event';

const event: Event<typeof Events.GuildMemberAdd> = {
	name: Events.GuildMemberAdd,
	once: false,
	async execute(member: GuildMember) {
		console.log(`${member.displayName} joined the server.`);
		await handleAuthentication(member);
	},
};

export default event;
