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

export const unauthenticate = async (req: Request, res: Response) => {
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
		redirectUri: config.MICROSOFT_UNAUTH_REDIRECT_URI,
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
		.select(
			'id,displayName,userPrincipalName,surname,givenName,mail,extension_863469052ea0410fbbfba8022e865293_discordId,jobTitle',
		)
		.get()
		.catch(() => {
			return res.status(500).render('error', {
				message:
					'Das authetifizierte Profil konnte nicht von Microsoft geladen werden.',
				statusCode: '500',
			});
		})) as UserData;

	const extensionPropertyKey = Object.keys(userData).find(
		(key) => key.startsWith('extension_') && key.endsWith('_discordId'),
	) as ExtensionPropertyKey;

	if (userData[extensionPropertyKey] !== discordId) {
		return res.status(400).render('error', {
			message: 'Das verwendete Microsoft-Konto passt nicht zum discord account',
			statusCode: '400',
		});
	}

	const userId = userData.id;
	console.log('Authenticated user ID:', userId);

	const appToken = await getAppToken(msalClient);

	if (appToken.error != null) {
		return res.status(500).render('error', {
			message: 'Failed to get AppToken',
			statusCode: '500',
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
			message:
				'Beim löschen deiner discordId in Entra ist ein Fehler aufgetreten',
			statusCode: '400',
		});
	}

	const p = pendingUnauthByDiscordId.get(discordId);
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
		await finishUnauthentication(member, message, userData);
	} catch (e) {
		console.log(e);
		// await message.edit({ components: [createErrorContainer()] });
	} finally {
		pendingUnauthByDiscordId.delete(discordId);
	}

	res.status(200).render('success', {
		message:
			'Dein Discord-Profil und Schul-Microsoft-Konto sind nun nicht mehr verknüpft!',
	});
};
