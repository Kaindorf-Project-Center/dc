// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from "discord.js";
import { loadEvents } from "./loader";
import { config } from "@monorepo/common";

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

loadEvents(client);

// Log in to Discord with your client's token
client.login(config.DISCORD_TOKEN);
