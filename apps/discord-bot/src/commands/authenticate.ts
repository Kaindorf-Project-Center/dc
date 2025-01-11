import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { handleAuthentication } from "../utils/authHandler";
import { Command } from "../interfaces/Command";
import { config } from "common";

const authenticateCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("authenticate")
    .setDescription("Manually start the authentication process."),
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Fetch the guild by its ID
      const guild =
        interaction.client.guilds.cache.get(config.GUILD_ID) ||
        (await interaction.client.guilds.fetch(config.GUILD_ID));

      if (!guild) {
        await interaction.reply({
          content: "Guild not found.",
          ephemeral: true,
        });
        return;
      }

      // Fetch the member from the guild
      const member = await guild.members.fetch(interaction.user.id);

      if (!member) {
        await interaction.reply({
          content: "Member not found.",
          ephemeral: true,
        });
        return;
      }

      // Trigger authentication
      await handleAuthentication(member, interaction);
    } catch (error) {
      console.error("Error in /authenticate command:", error);
      await interaction.reply({
        content:
          "An error occurred while processing the authentication request.",
        ephemeral: true,
      });
    }
  },
};

export default authenticateCommand;
