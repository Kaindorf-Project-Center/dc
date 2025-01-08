import {
  GuildMember,
  Events,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageComponentInteraction,
} from "discord.js";
import { randomBytes } from "node:crypto";
import { config } from "common";
import type { Event } from "../types";
import { log } from "node:console";

const event: Event<typeof Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    console.log(member.displayName);

    const dmChannel = await member.createDM();
    const state = randomBytes(16).toString("hex"); // For CSRF protection
    const authUrl = `https://login.microsoftonline.com/${
      config.MICROSOFT_TENANT_ID
    }/oauth2/v2.0/authorize?client_id=${
      config.MICROSOFT_CLIENT_ID
    }&response_type=code&redirect_uri=${encodeURIComponent(
      config.MICROSOFT_REDIRECT_URI
    )}&response_mode=query&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&state=${state}`;

    // Create the embed and button
    const embed = new EmbedBuilder()
      .setTitle("Authentication Required")
      .setDescription(
        "Please authenticate using your school Microsoft account to gain access to the server."
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

    // Send the initial message
    const message = await dmChannel.send({
      embeds: [embed],
      components: [actionRow],
    });

    // Define the filter for the collector
    const filter = (interaction: MessageComponentInteraction) =>
      interaction.isButton() && interaction.customId === `verify-${member.id}`;

    // Create the message component collector
    const collector = dmChannel.createMessageComponentCollector({
      filter,
      time: 60000 * 5, // 5 min timeout for the button
    });

    // Handle the end of the collector
    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        const embed = new EmbedBuilder()
          .setTitle("Authentication Expired")
          .setDescription(
            "The Authentication has expired please use `/verify` to try again"
          )
          .setColor("Red");

        await message.edit({
          embeds: [embed], // Add the new embed
          components: [], // Empty array to remove the buttons
        });

        console.log("Message edited after timeout.");
      }
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();

      console.log(`${member.displayName} clicked the verify button.`);
    });
  },
};

export default event;
