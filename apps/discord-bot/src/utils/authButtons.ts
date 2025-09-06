import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { Result } from 'common/src/tryCatch';

export function createAuthButton(url: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setURL(url)
    .setLabel('Sign in with Microsoft')
    .setStyle(ButtonStyle.Link);
  return button;
}

export function createVerifyButton(memberId: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setCustomId(`verify-${memberId}`)
    .setLabel('Verify')
    .setStyle(ButtonStyle.Secondary);
  return button;
}

export function createActionRow(
  buttons: ButtonBuilder[]
): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
  return row;
}
