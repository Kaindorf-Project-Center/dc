import type { ClientEvents, Events } from "discord.js";

export interface Event<K extends keyof ClientEvents> {
  name: K | Events;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}
