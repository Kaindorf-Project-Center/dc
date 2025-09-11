import { Events } from 'discord.js';
import type { Interaction } from 'discord.js';

import type { Event } from '../interfaces/Event';
import type { ExtendedClient } from 'src/interfaces/ExtendedClient';

const event: Event<typeof Events.InteractionCreate> = {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = (interaction.client as ExtendedClient).commands.get(
			interaction.commandName,
		);
		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			await command.execute(interaction);
		}
		catch (error: unknown) {
			if (error instanceof Error) {
				console.error(error);
			}
			else {
				console.error(String(error));
			}

			const payload = {
				content: 'There was an error while executing this command!',
				ephemeral: true as const,
			};

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(payload);
			}
			else {
				await interaction.reply(payload);
			}
		}
	},
};

export default event;
