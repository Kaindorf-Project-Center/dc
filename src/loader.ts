import type { Client, ClientEvents } from 'discord.js';
import { Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import type { Event } from './interfaces/Event';
import type { Command } from './interfaces/Command';

type DefaultExport<T> = { default: T } | T;

async function importDefault<T>(filePath: string): Promise<T> {
	const mod = (await import(filePath)) as DefaultExport<T>;
	return (mod as { default?: T }).default ?? (mod as T);
}

export const loadEvents = async (client: Client): Promise<void> => {
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.ts'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = await importDefault<Event<keyof ClientEvents>>(filePath);

		const handler = (...args: ClientEvents[typeof event.name]) => {
			void event.execute(...args);
		};

		if (event.once) {
			client.once(event.name, handler);
		}
		else {
			client.on(event.name, handler);
		}
	}
};

export const loadCommands = async (): Promise<Collection<string, Command>> => {
	// Hinweis: besser direkt auf ExtendedClient schreiben statt zurückzugeben.
	console.log('[INFO] loading commands...');
	const commandsPath = path.join(__dirname, 'commands');
	const commands = new Collection<string, Command>();

	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await importDefault<Command>(filePath);

		if (!command?.data) {
			console.error(`Command in file ${file} is missing a 'data.name' property.`);
			continue;
		}

		commands.set(command.data.name, command);
		console.info(`[INFO] loading the command from ${file}`);
	}
	return commands;
};
