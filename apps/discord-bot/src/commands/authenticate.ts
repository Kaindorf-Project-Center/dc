import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { handleAuthentication } from '../handlers/authHandler';
import { Command } from '../interfaces/Command';
import { config } from 'common';
import { tryCatch, Result } from 'common/src/tryCatch';

const authenticateCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('authenticate')
    .setDescription('Startet manuell den Authentifizierungsprozess.'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.client.guilds.cache.get(config.GUILD_ID);

    if (guild == null) {
      await interaction.reply({ content: 'Guild not found.', ephemeral: true });
      return;
    }

    const memberResult = await tryCatch(
      guild.members.fetch(interaction.user.id)
    );
    if (memberResult.error != null) {
      await tryCatch(
        interaction.reply({ content: 'Member not found.', ephemeral: true })
      );
      return;
    }
    await handleAuthentication(memberResult.data, interaction);
  },
};

export default authenticateCommand;
