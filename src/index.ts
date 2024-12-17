// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from "discord.js";
import { loadEvents } from "./loader";

const token = process.env.DISORD_TOKEN;

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

loadEvents(client);

// Log in to Discord with your client's token
client.login(token);
