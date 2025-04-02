import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { Result } from "common/src/tryCatch";

export function createVerifyButton(
  memberId: string
): Result<ButtonBuilder, Error> {
  try {
    const button = new ButtonBuilder()
      .setCustomId(`verify-${memberId}`)
      .setLabel("Verify")
      .setStyle(ButtonStyle.Primary);
    return { data: button, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export function createActionRow(
  button: ButtonBuilder
): Result<ActionRowBuilder<ButtonBuilder>, Error> {
  try {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    return { data: row, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}
