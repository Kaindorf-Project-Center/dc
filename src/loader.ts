import type { Client } from 'discord.js';
import { Collection } from 'discord.js';
import type { Event } from './interfaces/Event';
import fs from 'fs';
import path from 'path';
import type { Command } from './interfaces/Command';

export const loadEvents = (client: Client) => {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.ts'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event: Event<any> = require(filePath).default;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
};

export const loadCommands = (): Collection<string, Command> => {
  // TODO: write directly to extendendclient instead of returning collection
  console.log('[INFO] loading commands...');
  const commandsPath = path.join(__dirname, 'commands');
  const commands = new Collection<string, Command>();

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.ts'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (command.default == null || command.default.data == null) {
      console.error(
        `Command in file ${file} is missing a 'data.name' property.`
      );
      continue;
    }

    commands.set(command.default.data.name, command.default);
    console.info(`[INFO] loading the command from ${file}`);
  }
  return commands;
};
