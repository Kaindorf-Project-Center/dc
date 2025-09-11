import { REST, Routes } from 'discord.js';
import type { ExtendedClient } from './interfaces/ExtendedClient';
import { config } from './config';
import type {
	APIApplicationCommand,
	RESTPutAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';

export const registerCommands = async (extendedClient: ExtendedClient): Promise<void> => {
	const commandData: RESTPutAPIApplicationCommandsJSONBody = extendedClient.commands
		.map((command) => command.data.toJSON());

	const rest = new REST().setToken(config.DISCORD_TOKEN);

	try {
		console.log(`Started refreshing ${commandData.length} application (/) commands.`);

		const data = (await rest.put(
			Routes.applicationCommands(config.CLIENT_ID),
			{ body: commandData },
		)) as APIApplicationCommand[];

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
};
