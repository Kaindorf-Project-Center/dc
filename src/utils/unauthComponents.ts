import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { createActionRow, createAuthButton } from './authButtons';
import type * as i18n from 'src/i18n/i18n';

export function createUnauthContainer(url: string, t: i18n.TFunction): ContainerBuilder {
	const headerText = new TextDisplayBuilder().setContent(t('unauth.header'));
	const firstHeaderText = new TextDisplayBuilder().setContent(t('unauth.msHeader'));
	const firstContentText = new TextDisplayBuilder().setContent(t('unauth.msContent'));
	const firstSubText = new TextDisplayBuilder().setContent(t('unauth.msSub'));

	const authButton = createAuthButton(url, t);
	const actionRowResult = createActionRow([authButton]);

	return new ContainerBuilder()
		.addTextDisplayComponents(headerText, firstHeaderText, firstContentText, firstSubText)
		.addActionRowComponents(actionRowResult);
}

export function createUnauthSuccessContainer(t: i18n.TFunction): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(t('unauth.successHeader'));
	const firstContentText = new TextDisplayBuilder().setContent(t('unauth.successBody'));
	const subContentText = new TextDisplayBuilder().setContent(t('unauth.successSub'));

	return new ContainerBuilder()
		.setAccentColor(5763719)
		.addTextDisplayComponents(firstHeaderText, firstContentText, subContentText);
}

export function createUnauthErrorContainer(t: i18n.TFunction, reason?: string): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(t('unauth.failHeader'));
	const firstContentText = new TextDisplayBuilder().setContent(t('common.errors.verifyFailed'));

	const container = new ContainerBuilder()
		.setAccentColor(15548997)
		.addTextDisplayComponents(firstHeaderText, firstContentText);

	if (reason && reason !== '') {
		container.addTextDisplayComponents(new TextDisplayBuilder().setContent(reason));
	}
	return container;
}

export function createUnauthTimeoutContainer(t: i18n.TFunction): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(t('unauth.timeoutHeader'));
	const firstContentText = new TextDisplayBuilder().setContent(t('common.errors.unauthExpired'));

	return new ContainerBuilder()
		.setAccentColor(15548997)
		.addTextDisplayComponents(firstHeaderText, firstContentText);
}
