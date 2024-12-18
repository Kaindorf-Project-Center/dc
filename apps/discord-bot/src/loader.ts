import { Client } from "discord.js";
import type { Event } from "./types";
import fs from "fs";
import path from "path";

export const loadEvents = (client: Client) => {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event: Event<any> = require(filePath).default;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
};
