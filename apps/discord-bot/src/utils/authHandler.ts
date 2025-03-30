import {
  GuildMember,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageComponentInteraction,
  ChatInputCommandInteraction,
  Role,
} from "discord.js";
import { randomBytes } from "node:crypto";
import { config } from "common";

import fs from "fs";
import YAML from "yaml";

export async function handleAuthentication(
  member: GuildMember,
  interaction?: ChatInputCommandInteraction
) {
  const dmChannel = await member.createDM();

  // Generate a CSRF token
  const csrfToken = randomBytes(16).toString("hex");

  // Build the state payload including both the CSRF token and Discord ID
  const statePayload = {
    csrf: csrfToken,
    discordId: member.id,
  };

  // Encode the state payload as a JSON string, then Base64 encode it
  const encodedState = Buffer.from(JSON.stringify(statePayload)).toString(
    "base64"
  );

  const authUrl = `https://login.microsoftonline.com/${
    config.MICROSOFT_TENANT_ID
  }/oauth2/v2.0/authorize?client_id=${
    config.MICROSOFT_CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURIComponent(
    config.MICROSOFT_REDIRECT_URI
  )}&response_mode=query&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&state=${encodedState}`;

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

  let message;
  if (interaction != null) {
    message = await interaction.reply({
      embeds: [embed],
      components: [actionRow],
      fetchReply: true,
    });
  } else {
    message = await dmChannel.send({
      embeds: [embed],
      components: [actionRow],
    });
  }

  const filter = (i: MessageComponentInteraction) =>
    i.isButton() && i.customId === `verify-${member.id}`;

  const collector = dmChannel.createMessageComponentCollector({
    filter,
    time: 60000 * 5, // timeout after 5 minutes
  });

  collector.on("collect", async (buttonInteraction) => {
    if (!buttonInteraction.isButton()) return;

    const backendUrl = `${config.BACKEND_BASE_URL}/verify/${member.id}`;
    try {
      const response: any = await fetch(backendUrl, { method: "GET" });
      if (response.ok) {
        const user = (await response.json()).user;

        const userShorthand: string = user.userPrincipalName.split("@")[0];
        console.log(userShorthand);
        const userShorthandMatch = userShorthand.match(
          /[a-z]{5}([abcdnmzy])(\d\d)/
        );
        if (userShorthandMatch == null) {
          throw new Error("userShorthand not matching student pattern");
        }
        console.log(userShorthandMatch);

        const letter = userShorthandMatch[1];

        const mapping = YAML.parse(
          fs.readFileSync(
            "./apps/discord-bot/shorthand-role-mapping.yaml",
            "utf8"
          )
        );
        if (!(letter in mapping)) {
          throw new Error("letter not mappable");
        }

        const department = mapping[letter].department;
        const yarak = mapping[letter].longname + userShorthandMatch[2];

        const newNickname = user.givenName + user.surname;

        let deptRole: Role = member.guild.roles.cache.find(
          (r) => r.name === department
        )!;
        if (deptRole == null) {
          deptRole = await member.guild.roles.create({
            name: department,
          });
        }
        await member.roles.add(deptRole);

        let classRole = member.guild.roles.cache.find((r) => r.name === yarak);
        if (classRole == null) {
          classRole = await member.guild.roles.create({
            name: yarak,
          });
        }
        await member.roles.add(classRole);

        // Update the original message after successful verification
        const successEmbed = new EmbedBuilder()
          .setTitle("Verification Successful")
          .setDescription("You have been successfully verified! 🎉")
          .setColor("Green");

        await message.edit({
          embeds: [successEmbed],
          components: [], // Remove the buttons
        });

        collector.stop("verified");
      } else {
        console.log(response);
        const errorEmbed = new EmbedBuilder()
          .setTitle("Verification failed.")
          .setDescription("Please try again later.")
          .setColor("Red");

        await message.edit({
          embeds: [errorEmbed], // Replace with timeout embed
          components: [], // Remove the buttons
        });
        buttonInteraction.deferUpdate();

        collector.stop("failed");
      }
    } catch (error) {
      console.error("Error verifying user:", error);

      const errorEmbed = new EmbedBuilder()
        .setTitle("Verification failed.")
        .setDescription("An error occurred during verification.")
        .setColor("Red");

      await message.edit({
        embeds: [errorEmbed], // Replace with timeout embed
        components: [], // Remove the buttons
      });
      buttonInteraction.deferred = true;
    }
  });

  collector.on("end", async (collected, reason) => {
    if (reason === "time") {
      try {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle("Authentication Timed Out!")
          .setDescription(
            "You can trigger authentication manually with </authenticate:1327405925400711293>"
          )
          .setColor("Red");

        await message.edit({
          embeds: [timeoutEmbed], // Replace with timeout embed
          components: [], // Remove the buttons
        });

        console.log(`Verification for user ${member.user.username} timed out!`);
      } catch (error) {
        console.error("Failed to edit the message:", error);
      }
    } else {
      console.log(`Collector for user ${member.user.username} ended.`);
    }
  });
}
