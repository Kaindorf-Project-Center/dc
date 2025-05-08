// Require the necessary discord.js classes
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { loadCommands, loadEvents } from './loader';
import { config } from 'common';
import { Command } from './interfaces/Command';
import { ExtendedClient } from './interfaces/ExtendedClient';

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
}) as ExtendedClient;

loadEvents(client);

client.commands = new Collection<string, Command>();
loadCommands().forEach((command, key) => client.commands.set(key, command));

// Log in to Discord with your client's token
client.login(config.DISCORD_TOKEN);
