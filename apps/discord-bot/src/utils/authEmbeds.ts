import { EmbedBuilder } from 'discord.js';
import { Result } from 'common/src/tryCatch';

export function createAuthEmbed(authUrl: string): Result<EmbedBuilder, Error> {
  try {
    const embed = new EmbedBuilder()
      .setTitle('Authentication Required')
      .setDescription(
        'Bitte authentifiziere dich mit deinem schulischen Microsoft-Konto. Nachdem du fertig bist, drücke "Verify", um Zugriff auf den Server zu erhalten.'
      )
      .setURL(authUrl)
      .setColor('Blue');
    return { data: embed, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export function createSuccessEmbed(): Result<EmbedBuilder, Error> {
  try {
    const embed = new EmbedBuilder()
      .setTitle('Verification Successful')
      .setDescription('Die Verifizierung war erfolgreich.')
      .setColor('Green');
    return { data: embed, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export function createErrorEmbed(): Result<EmbedBuilder, Error> {
  try {
    const embed = new EmbedBuilder()
      .setTitle('Verification Failed')
      .setDescription('Es ist ein Fehler bei der Verifizierung aufgetreten.')
      .setColor('Red');
    return { data: embed, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export function createTimeoutEmbed(): Result<EmbedBuilder, Error> {
  try {
    const embed = new EmbedBuilder()
      .setTitle('Authentication Timed Out')
      .setDescription(
        'Die Authentifizierung ist abgelaufen. Bitte verwenden Sie /authenticate, um es erneut zu versuchen.'
      )
      .setColor('Red');
    return { data: embed, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}
