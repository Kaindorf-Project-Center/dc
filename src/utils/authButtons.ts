import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import type { TFunction } from 'src/i18n/i18n';

export function createAuthButton(url: string, t: TFunction): ButtonBuilder {
	const button = new ButtonBuilder()
		.setURL(url)
		.setLabel(t('signInButton'))
		.setStyle(ButtonStyle.Link);
	return button;
}

export function createVerifyButton(
	memberId: string,
	t: TFunction,
): ButtonBuilder {
	const button = new ButtonBuilder()
		.setCustomId(`verify-${memberId}`)
		.setLabel(t('verify.buttonText'))
		.setStyle(ButtonStyle.Secondary);
	return button;
}

export function createActionRow(
	buttons: ButtonBuilder[],
): ActionRowBuilder<ButtonBuilder> {
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
	return row;
}
