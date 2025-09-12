import { Client, GatewayIntentBits } from 'discord.js';
import { loadCommands, loadEvents } from './loader';
import type { ExtendedClient } from './interfaces/ExtendedClient';
import { initializeWebServer } from './server';
import { config } from './config';

export const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
}) as ExtendedClient;

await loadEvents(client);

client.commands = await loadCommands();

await client.login(config.DISCORD_TOKEN);

await initializeWebServer();
