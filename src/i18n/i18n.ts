import { Locale } from 'discord.js';

export type Lang = 'de' | 'en';
export type TFunction = (key: I18nKey, vars?: Record<string, string | number>) => string;

const resources = {
	de: {
		signInButton: 'Registrieren mit Microsoft',
		web: {
		  success: {
				title: 'Erfolg',
				heading: 'Das hat funktioniert',
				description: 'Die Verknüpfung von deinem Discord-Profil und Schul-Microsoft-Konto war erfolgreich!',
				openDiscord: 'Öffne Discord',
				code: '200',
		  },
			successUnlink: {
				title: 'Erfolg',
				heading: 'Verknüpfung aufgehoben',
				description: 'Dein Discord-Profil und dein Schul-Microsoft-Konto sind nun nicht mehr verknüpft!',
				openDiscord: 'Öffne Discord',
				code: '200',
			},
		  error: {
				title: 'Fehler',
				heading: 'Da ist was schiefgelaufen',
				genericDescription: 'Beim Versuch, dein Discord-Profil mit deinem Schul-Microsoft-Konto zu verknüpfen, ist ein Fehler aufgetreten.',
				detailsLabel: 'Details:',
		  },
		  common: {
				help: 'Für Hilfe wende dich an einen Sys-Admin oder Praktikantenkarli.',
		  },
		},
		unauth: {
			accessTokenError: 'Fehler beim Laden des Zugriff-Tokens.',
			msLoadError: 'Das authentifizierte Microsoft-Profil konnte nicht geladen werden.',
			appTokenError: 'Fehler beim Laden des App-Tokens.',
			mismatchAccount: 'Das verwendete Microsoft-Konto passt nicht zum Discord-Account.',
			deleteDiscordIdError: 'Beim Löschen deiner Discord-ID in Entra ist ein Fehler aufgetreten.',
			header: '**Erfülle** die folgende **Abmeldung**, um den Zugang zum Kaindorf-Discord-Server **zu entfernen**:',
			msHeader: '## Entkoppeln mit Microsoft',
			msContent: '**Drücke** den folgenden **Link**, und melde dich mit dem Microsoft-Konto an, das du bei der Registrierung verwendet hast.',
			msSub: '-# Dadurch wird deine Discord-ID von deinem Schul-Microsoft-Konto entfernt, deine Rollen werden entzogen und dein Spitzname zurückgesetzt; du verlierst damit den Serverzugang.',
			successHeader: '## Erfolgreich entauthentifiziert',
			successBody: 'Die Entauthentifizierung war erfolgreich. Deine Rollen wurden entfernt, dein Spitzname zurückgesetzt und die Verknüpfung mit deinem Schul-Microsoft-Konto wurde aufgehoben.',
			successSub: '### Hoffentlich hattest du eine gute Zeit auf dem Server!',
			failHeader: '## Entauthentifizierung fehlgeschlagen',
			timeoutHeader: '## Entauthentifizierung abgelaufen',
		},
		common: {
			errors: {
				guildNotFound: 'Server nicht gefunden.',
				memberNotFound: 'Mitglied nicht gefunden.',
				verifyFailed: 'Es ist ein Fehler bei der Verifizierung aufgetreten. Versuche es später erneut oder wende dich an einen Sys-Admin oder Praktikanten.',
				authExpired: 'Die Authentifizierung ist abgelaufen. Bitte verwende /authenticate, um es erneut zu versuchen',
				channelNotTextBased: 'Dieser Kanal ist kein Textkanal.',
				_505: 'Interner Server Fehlher.',
				patchUser: 'Fehler beim Updaten des Benutzers.',
				invalidOrExpiredState: 'Invalider oder abgelaufener Status.',
				unauthExpired: 'Die Entauthentifizierung ist abgelaufen. Bitte verwende /unauthenticate, um es erneut zu versuchen.',
			},
		},
		auth: {
			header: '**Erfülle** die folgende **Anmeldung**, um Zugang zum Kaindorf-Discord-Server **zu erhalten**:',
			msHeader: '## Anmeldung mit Microsoft',
			msContent: '**Drücke** den folgenden **Link**, und melde dich mit deinem von der Schule bereitgestellten Microsoft-Konto an.',
			msSub: '-# Dadurch wird deine Discord-ID mit deinem Microsoft-Konto der Schule assoziiert und du erhältst die richtigen Rollen zu deinem Jahrgang und deiner Abteilung; zudem wird dein Spitzname auf deinen **echten Namen** gesetzt.',
			btnSignIn: 'Mit Microsoft anmelden',
			successHeader: '## Verifizierung erfolgreich',
			successBody: 'Die Verifizierung war erfolgreich, du hast jetzt vollen Zugriff auf den Server und kannst dich mit den anderen Schülern und Ex-Schülern unterhalten.',
			successSub: '### Viel Spaß!',
			failHeader: '## Verifizierung fehlgeschlagen',
			timeoutHeader: '## Authentifizierung abgelaufen',
		},
		status: {
			title: 'Status',
			authenticatd: 'authentifiziert',
			notAuthenticated: 'nicht authentifiziert',
		},
		callback: {
			accessTokenError: 'Fehler beim laden des Zugriff-Tokens.',
			msLoadError: 'Das authetifizierte Profil konnte nicht von Microsoft geladen werden.',
			appTokenError: 'Fehler beim Laden des Applikations-Token.',
			discordIdAlreadyUsed: 'Der verwendete Discord-Account ist bereits mit einem anderen Microsoft-Schulkonto Assoziiert.',
		},
		verify: {
			authenticated: 'Benutzer ist authentifiziert',
			notFoundOr404: 'Benutzer nicht gefunden oder nicht authentifiziert',
			wrongAbbr: 'Dein Kürzel entspricht nicht dem Muster!',
			buttonText: 'Verifizieren',
		},
	},
	en: {
		signInButton: 'Sign in with Microsoft',
		web: {
			success: {
				title: 'Success',
				heading: 'That worked',
				description: 'Linking your Discord profile with your school Microsoft account succeeded!',
				openDiscord: 'Open Discord',
				code: '200',
			},
			successUnlink: {
				title: 'Success',
				heading: 'Link removed',
				description: 'Your Discord profile and school Microsoft account are no longer linked!',
				openDiscord: 'Open Discord',
				code: '200',
			},
			error: {
				title: 'Error',
				heading: 'Something went wrong',
				genericDescription: 'An error occurred while trying to link your Discord profile with your school Microsoft account.',
				detailsLabel: 'Details:',
			},
			common: {
				help: 'For help, contact a sysadmin or Praktikantenkarli.',
			},
		},
		unauth: {
			accessTokenError: 'Failed to acquire access token.',
			msLoadError: 'The authenticated Microsoft profile could not be loaded.',
			appTokenError: 'Failed to get app token.',
			mismatchAccount: 'The Microsoft account used does not match the Discord account.',
			deleteDiscordIdError: 'An error occurred while deleting your Discord ID in Entra.',
			header: '**Complete** the following **unlink** to remove your access to the Kaindorf Discord server:',
			msHeader: '## Unlink with Microsoft',
			msContent: '**Click** the link below and sign in with the same school Microsoft account you used during registration.',
			msSub: '-# This removes your Discord ID from your school Microsoft account, revokes your roles, and resets your nickname; you will lose access to the server.',
			successHeader: '## Unlink successful',
			successBody: 'Unlinking completed. Your roles were removed, your nickname was reset, and your Discord profile was disconnected from your school Microsoft account.',
			successSub: '### Hope you had a good time on the server!',
			failHeader: '## Unlink failed',
			timeoutHeader: '## Unlink session expired',
		},
		common: {
			errors: {
				guildNotFound: 'Guild not found.',
				memberNotFound: 'Member not found.',
				verifyFailed: 'An error occurred during verification. Try again later or contact a sysadmin or Praktikantenkarli.',
				authExpired: 'Authentication expired. Please use /authenticate to try again.',
				channelNotTextBased: 'Channel not text-based',
				_505: 'Internal server errror',
				patchUser: 'Error pattching User',
				invalidOrExpiredState: 'Invalid or expired state.',
				unauthExpired: 'Unauthentication expired. Please use /unauthenticate to try again.',
			},
		},
		auth: {
			header: '**Complete** the following **sign-in** to get access to the Kaindorf Discord server:',
			msHeader: '## Sign in with Microsoft',
			msContent: '**Click** the link below and sign in with your school-provided Microsoft account.',
			msSub: '-# This links your Discord ID to your school Microsoft account, assigns the correct roles for your year and department, and sets your server nickname to your **real name**.',
			btnSignIn: 'Sign in with Microsoft',
			successHeader: '## Verification successful',
			successBody: 'Verification succeeded. You now have full access to the server and can chat with other students and alumni.',
			successSub: '### Have fun!',
			failHeader: '## Verification failed',
			timeoutHeader: '## Authentication expired',
		},
		status: {
			title: 'Status',
			authenticatd: 'authenticated',
			notAuthenticated: 'not authenticated',
		},
		callback: {
			accessTokenError: 'Failed to acquire access token.',
			msLoadError: 'The authenticated profile could not be loaded by Microsoft.',
			appTokenError: 'Failed to get AppToken',
			discordIdAlreadyUsed: 'The used discord account is already associated with a different Microsoft-school account.',
		},
		verify: {
			authenticated: 'User is authenticated',
			notFoundOr404: 'User not found or not authenticated.',
			wrongAbbr: 'Your abbreviation doesnt match the pattern!',
			buttonText: 'verify',
		},
	},
} as const;

type DeepKeys<T> = T extends object
  ? {
      [K in keyof T & string]:
        T[K] extends object ? `${K}` | `${K}.${DeepKeys<T[K]>}` : `${K}`
    }[keyof T & string]
  : never;

type I18nKey = DeepKeys<typeof resources['de']> ;

/* Compile time check */
type KeysEqual<A, B> =
  [DeepKeys<A>] extends [DeepKeys<B>] ? ([DeepKeys<B>] extends [DeepKeys<A>] ? true : never) : never;
const _keysParityCheck: KeysEqual<typeof resources['de'], typeof resources['en']> = true as const;

function get(obj: unknown, path: string): unknown {
	if (obj == null) return undefined;
	let cur: unknown = obj;
	for (const part of path.split('.')) {
		if (typeof cur !== 'object' || cur === null) return undefined;
		cur = (cur as Record<string, unknown>)[part];
		if (cur === undefined) return undefined;
	}
	return cur;
}

export function normalizeLocale(locale?: Locale | null): Lang {
	if (locale === Locale.German) return 'de';
	return 'en';
}

export function createT(lang: Lang): TFunction {
	const table = resources[lang];
	const fallback = resources.de;

	return (key: I18nKey, vars: Record<string, string | number> = {}) => {
		const v = get(table, key) ?? get(fallback, key) ?? key;
		const template = typeof v === 'string' || typeof v === 'number' ? String(v) : key;

		return template.replace(/\{(\w+)\}/g, (_m: string, k: string) => {
			const val = vars[k];
			return val === undefined ? '' : String(val);
		});
	};
}
