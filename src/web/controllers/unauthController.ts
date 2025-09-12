import type { Request, Response } from 'express';
import { client } from 'src';
import { config } from 'src/config';
import { pendingUnauthByDiscordId } from 'src/interfaces/Pending';
import { msalClient } from 'src/server';
import { tryCatch } from 'src/utils/tryCatch';
import { graphClientWithToken } from '../helpers/graph';
import { setUserDiscordId } from '../helpers/setUserDiscordId';
import { getAppToken } from '../helpers/tokens';
import type { DecodedState } from '../interfaces/DecodedState';
import type { ExtensionPropertyKey, UserData } from '../interfaces/UserData';
import { finishUnauthentication } from '../helpers/finishUnauthentication';
import { createT } from 'src/i18n/i18n';
import { resolveLangByLocale } from 'src/i18n/language';

export const unauthenticate = async (req: Request, res: Response) => {
	const { code, state: encodedState } = req.query;

	const fallbackLang = 'en' as const;
	if (!code || !encodedState) {
		const t = createT(fallbackLang);
		return res.status(400).render('error', {
			lang: fallbackLang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '400',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('common.errors.invalidOrExpiredState'),
			help: t('web.common.help'),
		});
	}

	const decodedState = JSON.parse(
		Buffer.from(encodedState as string, 'base64').toString('utf-8'),
	) as DecodedState;

	const { csrf, discordId } = decodedState;

	const p = pendingUnauthByDiscordId.get(discordId);
	const lang = p ? resolveLangByLocale(p.locale) : fallbackLang;
	const t = createT(lang);

	if (!p || p.csrf !== csrf) {
		return res.status(400).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '400',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('common.errors.invalidOrExpiredState'),
			help: t('web.common.help'),
		});
	}

	const tokenRequest = {
		code: code as string,
		scopes: ['https://graph.microsoft.com/.default'],
		redirectUri: config.MICROSOFT_UNAUTH_REDIRECT_URI,
	};

	const tokenResponse = await tryCatch(
		msalClient.acquireTokenByCode(tokenRequest),
	);

	if (tokenResponse.error) {
		return res.status(500).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '500',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('unauth.accessTokenError'),
			help: t('web.common.help'),
		});
	}

	const accessToken = tokenResponse.data.accessToken;

	const graph = graphClientWithToken(accessToken);

	// Step 2: Get the authenticated user's profile
	const userData = await graph
		.api('/me')
		.select('id,displayName,userPrincipalName,surname,givenName,mail,extension_863469052ea0410fbbfba8022e865293_discordId,jobTitle')
		.get()
		.catch(() => null) as UserData | null;

	if (!userData) {
		return res.status(500).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '500',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('unauth.msLoadError'),
			help: t('web.common.help'),
		});
	}

	const extensionPropertyKey = Object.keys(userData).find(
		(key) => key.startsWith('extension_') && key.endsWith('_discordId'),
	) as ExtensionPropertyKey;

	if (userData[extensionPropertyKey] !== discordId) {
		return res.status(400).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '400',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('unauth.mismatchAccount'),
			help: t('web.common.help'),
		});
	}

	const userId = userData.id;
	console.log('Authenticated user ID:', userId);

	const appToken = await getAppToken(msalClient);

	if (appToken.error) {
		return res.status(500).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '500',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('unauth.appTokenError'),
			help: t('web.common.help'),
		});
	}

	const deleteDiscordIdResult = await setUserDiscordId(
		appToken.data,
		userId,
		null,
	);

	if (deleteDiscordIdResult.error) {
		console.error(deleteDiscordIdResult.error);
		return res.status(400).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '400',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('unauth.deleteDiscordIdError'),
			help: t('web.common.help'),
		});
	}

	// fetch Discord objects
	const guild = await client.guilds.fetch(p.guildId);
	const member = await guild.members.fetch(p.memberId);
	const channel = await client.channels.fetch(p.channelId);
	if (!channel?.isTextBased()) {
		return res.status(500).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '500',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('common.errors.channelNotTextBased'),
			help: t('web.common.help'),
		});
	}
	const message = await channel.messages.fetch(p.messageId);

	// do roles / nickname; edit UI
	try {
		await finishUnauthentication(member, message, userData, t);
	} catch (e) {
		console.log(e);
		// await message.edit({ components: [createErrorContainer()] });
	} finally {
		pendingUnauthByDiscordId.delete(discordId);
	}

	return res.status(200).render('success', {
		lang,
		title: t('web.successUnlink.title'),
		heading: t('web.successUnlink.heading'),
		statusCode: t('web.successUnlink.code'),
		description: t('web.successUnlink.description'),
		openDiscord: t('web.successUnlink.openDiscord'),
		help: t('web.common.help'),
	});
};
