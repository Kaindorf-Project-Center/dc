import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { createActionRow, createAuthButton } from './authButtons';

export function createUnauthContainer(url: string): ContainerBuilder {
	const headerText = new TextDisplayBuilder().setContent(
		'**Erfülle** die folgende Anmeldung **um den Zugang** zum Kaindorf-Discord-Server **zu verlieren**:',
	);

	const firstHeaderText = new TextDisplayBuilder().setContent(
		'## Anmeldung mit Microsoft',
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		'**Drücke** den folgenden **Link**, und melde dich mit deinem von der Schule bereitgestellten Microsoft-Konto an, welches du bereits bei der anmeldung verwendet hast.',
	);
	const firstSubText = new TextDisplayBuilder().setContent(
		'-# Dadurch wird deine Discord-ID von deinem Microsoft-Konto der Schule entfernt und dein Spitzname und deine Rollen werden zurückgesetzt, dadurch du verlierst den Zugang zum Kaindorf-Discord-Server',
	);

	const authButton = createAuthButton(url);

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

export function createUnauthSuccessContainer(): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(
		'## Erfolgreich Entauthentifiziert',
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		'Die Entauthentifizierung war erfolgreich, du hast deine Rollen am Server wurden dir entzogen und dein Spitzname zurückgesetzt, außerdem wurde dein Discord-Profil von deinem Microsoft-Schul-Account getrennt.',
	);

	const subContentText = new TextDisplayBuilder().setContent(
		'### Hoffentlich hattest du eine gute Zeit am Server!',
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

export function createUnauthErrorContainer(reason?: string): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(
		'## Entauthentifizierung fehlgeschlagen',
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		'Es ist ein Fehler bei der Verifizierung aufgetreten. Versuche es später erneut oder wende dich an einen Sys-Admin oder Praktikanten für Hilfe.',
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

export function createUnauthTimeoutContainer(): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(
		'## Entauthentifizierung abgelaufen',
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		'Die Entauthentifizierung ist abgelaufen. Bitte verwende /unauthenticate, um es erneut zu versuchen.',
	);

	const container = new ContainerBuilder()
		.setAccentColor(15548997)
		.addTextDisplayComponents(firstHeaderText, firstContentText);

	return container;
}
