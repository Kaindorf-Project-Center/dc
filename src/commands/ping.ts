import type { ChatInputCommandInteraction } from 'discord.js';
import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interfaces/Command';

const PingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .setContexts(InteractionContextType.BotDM),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong!');
  },
};

export default PingCommand;
