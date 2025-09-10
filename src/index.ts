// Require the necessary discord.js classes
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { loadCommands, loadEvents } from './loader';
import type { Command } from './interfaces/Command';
import type { ExtendedClient } from './interfaces/ExtendedClient';
import { initializeWebServer } from './server';
import { config } from './config';

// Create a new client instance
export const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
}) as ExtendedClient;

loadEvents(client);

client.commands = new Collection<string, Command>();
loadCommands().forEach((command, key) => client.commands.set(key, command));

// Log in to Discord with your client's token
client.login(config.DISCORD_TOKEN);

initializeWebServer();
