import {
  ContainerBuilder,
  EmbedBuilder,
  GuildMember,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';
import { Result } from 'common/src/tryCatch';
import {
  createActionRow,
  createAuthButton,
  createVerifyButton,
} from './authButtons';

export function createAuthContainer(
  member: GuildMember,
  url: string
): ContainerBuilder {
  const headerText = new TextDisplayBuilder().setContent(
    '**Erfülle** die folgenden zwei **Schritte Um Zugang** zum Kaindorf-Discord-Server **zu erhalten**:'
  );

  const firstHeaderText = new TextDisplayBuilder().setContent(
    '## 1. Anmeldung mit Microsoft'
  );

  const firstContentText = new TextDisplayBuilder().setContent(
    '**Drücke** den folgenden **Link**, und melde dich mit deinem von der Schule bereitgestellten Microsoft-Konto an.'
  );
  const firstSubText = new TextDisplayBuilder().setContent(
    '-# Dadurch wird deine Discord-ID mit deinem Microsoft-Konto der Schule assoziiert.'
  );

  const authButton = createAuthButton(url);

  const firstActionRowResult = createActionRow([authButton]);

  const seperator = new SeparatorBuilder();

  const secondHeaderText = new TextDisplayBuilder().setContent(
    '## 2. Überprüfe deine Anmeldung'
  );

  const secondContentText = new TextDisplayBuilder().setContent(
    '**Drücke** den folgenden **Button**, um deine Anmeldung zu überprüfen und Zugang zum Kaindorf-Discord-Server zu erhalten.'
  );
  const secondSubText = new TextDisplayBuilder().setContent(
    '-# Dadurch wird überprüft, ob deine Discord-ID mit einem Microsoft-Konto der Schule assoziiert ist, und du erhältst die richtigen Rollen zu deinem Jahrgang und Abteilung, zusätzlich wird dein Spitzname auf dem Server auf deinen Echten Namen gesetzt.'
  );

  const verifyButton = createVerifyButton(member.id);

  const secondActionRowResult = createActionRow([verifyButton]);

  const container = new ContainerBuilder()
    //.setAccentColor(3447003)
    .addTextDisplayComponents(
      headerText,
      firstHeaderText,
      firstContentText,
      firstSubText
    )
    .addActionRowComponents(firstActionRowResult)
    .addSeparatorComponents(seperator)
    .addTextDisplayComponents(
      secondHeaderText,
      secondContentText,
      secondSubText
    )
    .addActionRowComponents(secondActionRowResult);

  return container;
}

export function createSuccessContainer(): ContainerBuilder {
  const firstHeaderText = new TextDisplayBuilder().setContent(
    '## Verifizierung Erfolgreich'
  );

  const firstContentText = new TextDisplayBuilder().setContent(
    'Die Verifizierung war erfolgreich, du hast jetzt vollen Zugriff auf den Server und kannst dich mit den anderen Schülern und ex-Schülern unterhalten.'
  );

  const subContentText = new TextDisplayBuilder().setContent(
    '### Viel Spaß! 🥳'
  );

  const container = new ContainerBuilder()
    .setAccentColor(5763719)
    .addTextDisplayComponents(
      firstHeaderText,
      firstContentText,
      subContentText
    );

  return container;
}

export function createErrorContainer(reason?: string): ContainerBuilder {
  const firstHeaderText = new TextDisplayBuilder().setContent(
    '## Verifizierung Fehlgeschlagen'
  );

  const firstContentText = new TextDisplayBuilder().setContent(
    'Es ist ein Fehler bei der Verifizierung aufgetreten. Versuche es später erneut oder Wende dich an einen Sys-Admin oder Praktikanten für Hilfe.'
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

export function createTimeoutContainer(): ContainerBuilder {
  const firstHeaderText = new TextDisplayBuilder().setContent(
    '## Authentifizierung abgelaufen'
  );

  const firstContentText = new TextDisplayBuilder().setContent(
    'Die Authentifizierung ist abgelaufen. Bitte verwenden Sie /authenticate, um es erneut zu versuchen.'
  );

  const container = new ContainerBuilder()
    .setAccentColor(15548997)
    .addTextDisplayComponents(firstHeaderText, firstContentText);

  return container;
}
