import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { createActionRow, createAuthButton } from './authButtons';
import type * as i18n from 'src/i18n/i18n';

export function createAuthContainer(
	url: string,
	t: i18n.TFunction,
): ContainerBuilder {
	const headerText = new TextDisplayBuilder().setContent(t('auth.header'));

	const firstHeaderText = new TextDisplayBuilder().setContent(
		t('auth.msHeader'),
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		t('auth.msContent'),
	);
	const firstSubText = new TextDisplayBuilder().setContent(t('auth.msSub'));

	const authButton = createAuthButton(url, t);

	const actionRowResult = createActionRow([authButton]);

	const container = new ContainerBuilder()
		// .setAccentColor(3447003)
		.addTextDisplayComponents(
			headerText,
			firstHeaderText,
			firstContentText,
			firstSubText,
		)
		.addActionRowComponents(actionRowResult);

	return container;
}

export function createSuccessContainer(t: i18n.TFunction): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(
		t('auth.successHeader'),
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		t('auth.successBody'),
	);

	const subContentText = new TextDisplayBuilder().setContent(
		t('auth.successSub'),
	);

	const container = new ContainerBuilder()
		.setAccentColor(5763719)
		.addTextDisplayComponents(
			firstHeaderText,
			firstContentText,
			subContentText,
		);

	return container;
}

export function createErrorContainer(
	t: i18n.TFunction,
	reason?: string,
): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(
		t('auth.failHeader'),
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		t('common.errors.verifyFailed'),
	);

	const container = new ContainerBuilder()
		.setAccentColor(15548997)
		.addTextDisplayComponents(firstHeaderText, firstContentText);

	if (reason && reason !== '') {
		const detailText = new TextDisplayBuilder().setContent(reason);
		container.addTextDisplayComponents(detailText);
	}

	return container;
}

export function createTimeoutContainer(t: i18n.TFunction): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(
		t('auth.timeoutHeader'),
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		t('common.errors.authExpired'),
	);

	const container = new ContainerBuilder()
		.setAccentColor(15548997)
		.addTextDisplayComponents(firstHeaderText, firstContentText);

	return container;
}
