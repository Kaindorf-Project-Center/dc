import type { Request, Response } from 'express';
import { msalClient } from '../../server';
import { setUserDiscordId } from '../helpers/setUserDiscordId';
import { getAppToken } from '../helpers/tokens';
import { config } from '../../config';
import { tryCatch } from '../../utils/tryCatch';
import { graphClientWithToken } from '../helpers/graph';
import { finishVerification } from '../helpers/finishVerification';
import { createErrorContainer } from '../../utils/authComponents';
import { client } from '../../index';
import type { UserData } from '../interfaces/UserData';
import type { DecodedState } from '../interfaces/DecodedState';
import { pendingByDiscordId } from '../../interfaces/Pending';
import { resolveLangByLocale } from 'src/i18n/language';
import { createT } from 'src/i18n/i18n';

/* export const authenticate = async (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7);
  const authCodeUrlParams = {
    scopes: ['https://graph.microsoft.com/.default'],
    redirectUri: config.MICROSOFT_REDIRECT_URI,
    state,
  };

  const authCodeUrl = await tryCatch(
    msalClient.getAuthCodeUrl(authCodeUrlParams)
  );

  if (authCodeUrl.error != null) {
    return res
      .status(500)
      .json({ error: 'Failed to generate authentication URL.' });
  }

  return res.redirect(authCodeUrl.data); // Redirect the user to Microsoft login
};*/

// Callback (handle OAuth response)
export const callback = async (req: Request, res: Response) => {
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
			details: 'missing code or state',
			help: t('web.common.help'),
		});
	}

	const decodedState = JSON.parse(
		Buffer.from(encodedState as string, 'base64').toString('utf-8'),
	) as DecodedState;

	// Retrieve the CSRF token and Discord ID from the decoded state
	const { csrf, discordId } = decodedState;

	const p = pendingByDiscordId.get(discordId);
	const t = createT(resolveLangByLocale(p?.locale));
	const lang = p ? resolveLangByLocale(p.locale) : fallbackLang;

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
		redirectUri: config.MICROSOFT_REDIRECT_URI,
	};

	const tokenResponse = await tryCatch(
		msalClient.acquireTokenByCode(tokenRequest),
	);

	if (tokenResponse.error != null) {
		console.error(tokenResponse.error);
		return res.status(500).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '500',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('callback.accessTokenError'),
			help: t('web.common.help'),
		});
	}

	const accessToken = tokenResponse.data.accessToken;

	const graph = graphClientWithToken(accessToken);

	// Step 2: Get the authenticated user's profile
	const userData = (await graph
		.api('/me')
		.select('id,displayName,userPrincipalName,surname,givenName,mail')
		.get()
		.catch(() => {
			return res.status(500).render('error', {
				message: t('callback.msLoadError'),
				statusCode: '500',
			});
		})) as UserData;

	const userId = userData.id;
	console.log('Authenticated user ID:', userId);

	const appToken = await getAppToken(msalClient);

	if (appToken.error != null) {
		return res.status(500).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '500',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('callback.appTokenError'),
			help: t('web.common.help'),
		});
	}

	const setUserDiscordIdResult = await setUserDiscordId(
		appToken.data,
		userId,
		discordId,
	);

	if (
		setUserDiscordIdResult.error &&
		setUserDiscordIdResult.error.message === t('callback.discordIdAlreadyUsed')
	) {
		console.error(setUserDiscordIdResult.error);
		return res.status(400).render('error', {
			lang,
			title: t('web.error.title'),
			heading: t('web.error.heading'),
			statusCode: '400',
			description: t('web.error.genericDescription'),
			detailsLabel: t('web.error.detailsLabel'),
			details: t('callback.discordIdAlreadyUsed'),
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
		await finishVerification(member, message, userData, t);
	}
	catch (e) {
		console.log(e);
		await message.edit({ components: [createErrorContainer(t)] });
	}
	finally {
		pendingByDiscordId.delete(discordId);
	}

	return res.status(200).render('success', {
		lang,
		title: t('web.success.title'),
		heading: t('web.success.heading'),
		statusCode: t('web.success.code'),
		description: t('web.success.description'),
		openDiscord: t('web.success.openDiscord'),
		help: t('web.common.help'),
	});
};
