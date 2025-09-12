import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { createActionRow, createAuthButton } from './authButtons';

export function createAuthContainer(url: string): ContainerBuilder {
	const headerText = new TextDisplayBuilder().setContent(
		'**Erfülle** die folgende **Anmeldung um Zugang** zum Kaindorf-Discord-Server **zu erhalten**:',
	);

	const firstHeaderText = new TextDisplayBuilder().setContent(
		'## Anmeldung mit Microsoft',
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		'**Drücke** den folgenden **Link**, und melde dich mit deinem von der Schule bereitgestellten Microsoft-Konto an.',
	);
	const firstSubText = new TextDisplayBuilder().setContent(
		'-# Dadurch wird deine Discord-ID mit deinem Microsoft-Konto der Schule assoziiert und du erhältst die richtigen Rollen zu deinem Jahrgang und Abteilung, zusätzlich wird dein Spitzname auf dem Server auf deinen **Echten Namen** gesetzt.',
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

export function createAuthSuccessContainer(): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(
		'## Verifizierung Erfolgreich',
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		'Die Verifizierung war erfolgreich, du hast jetzt vollen Zugriff auf den Server und kannst dich mit den anderen Schülern und ex-Schülern unterhalten.',
	);

	const subContentText = new TextDisplayBuilder().setContent(
		'### Viel Spaß! 🥳',
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

export function createAuthErrorContainer(reason?: string): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(
		'## Verifizierung Fehlgeschlagen',
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		'Es ist ein Fehler bei der Verifizierung aufgetreten. Versuche es später erneut oder Wende dich an einen Sys-Admin oder Praktikanten für Hilfe.',
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

export function createAuthTimeoutContainer(): ContainerBuilder {
	const firstHeaderText = new TextDisplayBuilder().setContent(
		'## Authentifizierung abgelaufen',
	);

	const firstContentText = new TextDisplayBuilder().setContent(
		'Die Authentifizierung ist abgelaufen. Bitte verwenden Sie /authenticate, um es erneut zu versuchen.',
	);

	const container = new ContainerBuilder()
		.setAccentColor(15548997)
		.addTextDisplayComponents(firstHeaderText, firstContentText);

	return container;
}
