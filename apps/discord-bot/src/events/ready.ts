// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
import { Client, Events } from 'discord.js';
import type { Event } from '../interfaces/Event';
import { registerCommands } from '../register';
import { ExtendedClient } from '../interfaces/ExtendedClient';

const event: Event<typeof Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const extendedClient = client as ExtendedClient;

    console.log(`Ready! Logged in as ${client.user?.tag}`);
    await registerCommands(extendedClient);
  },
};

export default event;
