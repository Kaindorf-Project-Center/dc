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

	if (!code || !encodedState) {
		// return res.status(303).redirect('discord://');
		return res.status(400).render('error', {
			message: 'Missing code or state.',
			statusCode: '400',
		});
	}

	const decodedState = JSON.parse(
		Buffer.from(encodedState as string, 'base64').toString('utf-8'),
	) as DecodedState;

	// Retrieve the CSRF token and Discord ID from the decoded state
	const { csrf, discordId } = decodedState;
	console.log('CSRF Token:', csrf);
	console.log('Discord ID:', discordId);

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
			message: 'Failed to acquire access token.',
			statusCode: '500',
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
				message:
					'Das authetifizierte Profil konnte nicht von Microsoft geladen werden.',
				statusCode: '500',
			});
		})) as UserData;

	const userId = userData.id;
	console.log('Authenticated user ID:', userId);

	const appToken = await getAppToken(msalClient);

	if (appToken.error != null) {
		return res.status(500).render('error', {
			message: 'Failed to get AppToken',
			statusCode: '500',
		});
	}

	const setUserDiscordIdResult = await setUserDiscordId(
		appToken.data,
		userId,
		discordId,
	);

	if (
		setUserDiscordIdResult.error &&
		setUserDiscordIdResult.error.message === 'discordId already used'
	) {
		console.error(setUserDiscordIdResult.error);
		return res.status(400).render('error', {
			message:
				'Der verwendete Discord-Account ist bereits mit einem anderen Microsoft-Schulkonto Assoziiert.',
			statusCode: '400',
		});
	}

	const p = pendingByDiscordId.get(discordId);
	if (!p || p.csrf !== csrf) {
		return res.status(400).render('error', {
			message: 'Invalid or expired state.',
			statusCode: '400',
		});
	}

	// fetch Discord objects
	const guild = await client.guilds.fetch(p.guildId);
	const member = await guild.members.fetch(p.memberId);
	const channel = await client.channels.fetch(p.channelId);
	if (!channel?.isTextBased()) {
		return res.status(500).render('error', {
			message: 'Channel not text-based.',
			statusCode: '500',
		});
	}
	const message = await channel.messages.fetch(p.messageId);

	// do roles / nickname; edit UI
	try {
		await finishVerification(member, message, userData);
	}
	catch (e) {
		console.log(e);
		await message.edit({ components: [createErrorContainer()] });
	}
	finally {
		pendingByDiscordId.delete(discordId);
	}

	res.status(200).render('success');
};
