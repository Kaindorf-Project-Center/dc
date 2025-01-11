import {
  GuildMember,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  Interaction,
  MessageComponentInteraction,
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";
import { randomBytes } from "node:crypto";
import { config } from "common";

export async function handleAuthentication(member: GuildMember) {
  const dmChannel = await member.createDM();
  const state = randomBytes(16).toString("hex"); // For CSRF protection
  const authUrl = `https://login.microsoftonline.com/${
    config.MICROSOFT_TENANT_ID
  }/oauth2/v2.0/authorize?client_id=${
    config.MICROSOFT_CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURIComponent(
    config.MICROSOFT_REDIRECT_URI
  )}&response_mode=query&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&state=${state}&discordId=${
    member.id
  }`;

  const embed = new EmbedBuilder()
    .setTitle("Authentication Required")
    .setDescription(
      "Please authenticate using your school Microsoft account. When you are done, press `Verify` to gain access to the server."
    )
    .setURL(authUrl)
    .setColor("Blue");

  const verifyButton = new ButtonBuilder()
    .setCustomId(`verify-${member.id}`)
    .setLabel("Verify")
    .setStyle(ButtonStyle.Primary);

  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    verifyButton
  );

  await dmChannel.send({ embeds: [embed], components: [actionRow] });

  const filter = (interaction: MessageComponentInteraction) =>
    interaction.isButton() && interaction.customId === `verify-${member.id}`;

  const collector = dmChannel.createMessageComponentCollector({
    filter,
    time: 60000 * 5,
  });

  collector.on("collect", async (interaction) => {
    if (!interaction.isButton()) return;

    await interaction.deferReply({ ephemeral: true });

    const backendUrl = `${config.BACKEND_BASE_URL}/verify/${member.id}`;
    try {
      const response = await fetch(backendUrl, { method: "POST" });
      if (response.ok) {
        await interaction.followUp("You have been successfully verified! 🎉");
      } else {
        console.log(response);
        await interaction.followUp(
          "Verification failed. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      await interaction.followUp(
        "An error occurred during verification. Please contact support."
      );
    }
  });

  collector.on("end", () => {
    console.log(`Collector for user ${member.id} ended.`);
  });
}
