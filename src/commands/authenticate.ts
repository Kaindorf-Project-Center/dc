import type {
	ChatInputCommandInteraction } from 'discord.js';
import {
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';
import { handleAuthentication } from '../handlers/authHandler';
import type { Command } from '../interfaces/Command';
import { config } from '../config';
import { tryCatch } from '../utils/tryCatch';

const authenticateCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('authenticate')
		.setContexts(InteractionContextType.BotDM)
		.setDescription('Startet manuell den Authentifizierungsprozess.'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const guild = interaction.client.guilds.cache.get(config.GUILD_ID);

		if (guild == null) {
			await interaction.reply({ content: 'Guild not found.', ephemeral: true });
			return;
		}

		const memberResult = await tryCatch(
			guild.members.fetch(interaction.user.id),
		);
		if (memberResult.error != null) {
			await tryCatch(
				interaction.reply({ content: 'Member not found.', ephemeral: true }),
			);
			return;
		}
		await handleAuthentication(memberResult.data, interaction);
	},
};

export default authenticateCommand;
