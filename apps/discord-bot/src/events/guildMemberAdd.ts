import { GuildMember, Events } from "discord.js";
import { handleAuthentication } from "../utils/authHandler"; // Assuming the function is saved in utils/authHandler
import { Event } from "../interfaces/Event";

const event: Event<typeof Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    console.log(`${member.displayName} joined the server.`);
    await handleAuthentication(member);
  },
};

export default event;
