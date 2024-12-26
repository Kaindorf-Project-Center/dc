import { GuildMember, Events, EmbedBuilder } from "discord.js";
import { randomBytes } from "node:crypto";
import { config } from "@monorepo/common";
import type { Event } from "../types";

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

    const embed = new EmbedBuilder()
      .setTitle("Authentication Required")
      .setDescription(
        "Please authenticate using your school Microsoft account to gain access to the server."
      )
      .setURL(authUrl)
      .setColor("Blue");

    await dmChannel.send({ embeds: [embed] });
  },
};

export default event;
