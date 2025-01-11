import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { handleAuthentication } from "../utils/authHandler";
import { Command } from "../interfaces/Command";

// !!!!!
// command not working
// !!!!!
const authenticateCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("authenticate")
    .setDescription("Manually start the authentication process.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The member to authenticate")
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("target") || interaction.user;
    const member = await interaction.guild!.members.fetch(target.id);

    if (!member) {
      await interaction.reply({
        content: "Member not found.",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: `Starting authentication process for ${member.displayName}...`,
      ephemeral: true,
    });

    await handleAuthentication(member);
  },
};

export default authenticateCommand;
