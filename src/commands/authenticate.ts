import type { ChatInputCommandInteraction } from 'discord.js';
import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { handleAuthentication } from '../handlers/authHandler';
import type { Command } from '../interfaces/Command';
import { config } from '../config';
import { tryCatch } from '../utils/tryCatch';
import { getT } from 'src/i18n/language';

const authenticateCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('authenticate')
		.setContexts(InteractionContextType.BotDM)
		.setDescription('Starts the manual authentication process'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const guild = interaction.client.guilds.cache.get(config.GUILD_ID);
		const t = getT(interaction);

		if (guild == null) {
			await interaction.reply({
				content: t('common.errors.guildNotFound'),
				ephemeral: true,
			});
			return;
		}

		const memberResult = await tryCatch(
			guild.members.fetch(interaction.user.id),
		);
		if (memberResult.error != null) {
			await tryCatch(
				interaction.reply({
					content: t('common.errors.memberNotFound'),
					ephemeral: true,
				}),
			);
			return;
		}
		await handleAuthentication(memberResult.data, interaction);
	},
};

export default authenticateCommand;
