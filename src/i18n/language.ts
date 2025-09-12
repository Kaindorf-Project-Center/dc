import type { Interaction, Locale } from 'discord.js';
import { createT, normalizeLocale, type Lang, type TFunction } from './i18n';

export function resolveLang(interaction?: Interaction): Lang {
	return normalizeLocale(interaction?.locale ?? interaction?.guildLocale);
}


export function resolveLangByLocale(locale?: Locale): Lang {
	return normalizeLocale(locale);
}

export function getT(interaction?: Interaction): TFunction {
	return createT(resolveLang(interaction));
}
