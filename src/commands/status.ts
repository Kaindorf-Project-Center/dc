import type {
	ChatInputCommandInteraction } from 'discord.js';
import {
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';
import type { Command } from '../interfaces/Command';
import { config } from '../config';
import { tryCatch } from '../utils/tryCatch';
import { handleStatus } from '../handlers/statusHandler';

const StatusCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Get the status')
		.setContexts(InteractionContextType.BotDM),
	async execute(interaction: ChatInputCommandInteraction) {
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

		await handleStatus(memberResult.data, interaction);
	},
};

export default StatusCommand;
