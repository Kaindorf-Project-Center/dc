import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { Result } from 'common/src/tryCatch';

export function createAuthButton(url: string): Result<ButtonBuilder, Error> {
  try {
    const button = new ButtonBuilder()
      .setURL(url)
      .setLabel('Sign in with Microsoft')
      .setStyle(ButtonStyle.Link);
    return { data: button, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export function createVerifyButton(
  memberId: string
): Result<ButtonBuilder, Error> {
  try {
    const button = new ButtonBuilder()
      .setCustomId(`verify-${memberId}`)
      .setLabel('Verify')
      .setStyle(ButtonStyle.Primary);
    return { data: button, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export function createActionRow(
  buttons: ButtonBuilder[]
): Result<ActionRowBuilder<ButtonBuilder>, Error> {
  try {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    return { data: row, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}
