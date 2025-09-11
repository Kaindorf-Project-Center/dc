import { REST, Routes } from 'discord.js';
import type { ExtendedClient } from './interfaces/ExtendedClient';
import { config } from './config';

// and deploy your commands!
export const registerCommands = async (extendedClient: ExtendedClient) => {
	const commandData: any = extendedClient.commands.map(
		(command) => command.data,
	); // TODO: instead of loading again, access the commands from the client

	const rest = new REST().setToken(config.DISCORD_TOKEN);
	try {
		console.log(
			`Started refreshing ${commandData.length} application (/) commands.`,
		);

		// The put method is used to fully refresh all global commands with the current set
		const data: any = await rest.put(
			// TODO: type fixen?
			Routes.applicationCommands(config.CLIENT_ID),
			{ body: commandData },
		);

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`,
		);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
};
